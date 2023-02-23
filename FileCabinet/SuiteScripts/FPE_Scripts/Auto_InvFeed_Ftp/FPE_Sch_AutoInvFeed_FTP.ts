/**
 * Fleece Performance Engineering
 * ==============================
 * @author Matt Carter
 * @description A scheduled script to automate sending a CSV file of inventory stock to an FTP site
 *
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */

import { EntryPoints } from 'N/types'
import * as query from 'N/query'
import * as sftp from 'N/sftp'
import * as log from 'N/log'
import * as file from 'N/file'
import * as record from 'N/record'
import * as search from 'N/search'

interface QueryResult {
    itemid: string,
    quantity: number
}

interface ConfigData {
    custrecord_fpe_sftp_host: string
    custrecord_fpe_sftp_hostport: string
    custrecord_fpe_sftp_user: string
    custrecord_fpe_sftp_passguid: string
    custrecord_fpe_sftp_hostkey: string
}

export const execute: EntryPoints.Scheduled.execute = (scriptContext: EntryPoints.Scheduled.executeContext) => {

    let csv = 'sku,qty\n'

    log.debug('CSV Initial', csv)

    const data: QueryResult[] = query.runSuiteQL({query: queryString}).asMappedResults<QueryResult>()

    log.debug('Query Results', data)

    data.forEach(row => csv += `${row.itemid},${row.quantity}\n`)

    log.debug('CSV', csv)

    const csvFile = file.create({
        fileType: file.Type.CSV,
        name: 'FpeStockFeed.csv',
        folder: 237258,
        contents: csv
    })

    const csvFileID = csvFile.save()
    log.debug('CSV File ID', csvFileID)

    const configData: ConfigData = search.lookupFields({
        type: 'customrecord_fpe_sftp_config',
        id: 1,
        columns: ['custrecord_fpe_sftp_host', 'custrecord_fpe_sftp_hostport', 'custrecord_fpe_sftp_user', 'custrecord_fpe_sftp_passguid', 'custrecord_fpe_sftp_hostkey']
    }) as ConfigData

    const transfer = sftp.createConnection({
        url: configData.custrecord_fpe_sftp_host,
        port: parseInt(configData.custrecord_fpe_sftp_hostport),
        username: configData.custrecord_fpe_sftp_user,
        passwordGuid: configData.custrecord_fpe_sftp_passguid,
        hostKey: configData.custrecord_fpe_sftp_hostkey,
    })

    transfer.upload({
        file: csvFile,
        directory: './sftpuser'
    })
}

const queryString =
    `
    SELECT
        Item.itemid,
        
        CASE
        
            WHEN ( Item.custitem_fpe_usecount = 'F' AND Item.custitem_fpe_usemanual = 'F' AND Item.custitem_fpe_usebuildable = 'F' ) THEN 0
        
            WHEN ( Item.custitem_fpe_usecount = 'T' AND Item.custitem_fpe_usemanual = 'F' AND Item.custitem_fpe_usebuildable = 'F' ) THEN
                CASE
                    WHEN aggregateItemLocation.quantityOnHand IS NULL THEN 0
                    ELSE  aggregateItemLocation.quantityOnHand
                END
        
            WHEN ( Item.custitem_fpe_usecount = 'F' AND Item.custitem_fpe_usemanual = 'F' AND Item.custitem_fpe_usebuildable = 'T' ) THEN
                CASE
                    WHEN ( Item.custitem_sg_actual_available_to_build > Item.custitem_fpe_buildablemaximum ) THEN Item.custitem_fpe_buildablemaximum
                    ELSE Item.custitem_sg_actual_available_to_build
                END
        
            WHEN ( Item.custitem_fpe_usecount = 'T' AND Item.custitem_fpe_usemanual = 'F' AND Item.custitem_fpe_usebuildable = 'T' ) THEN
                CASE
                    WHEN ( aggregateItemLocation.quantityOnHand = 0 OR  aggregateItemLocation.quantityOnHand IS NULL AND Item.custitem_sg_actual_available_to_build > Item.custitem_fpe_buildablemaximum ) THEN Item.custitem_fpe_buildablemaximum
                    WHEN ( aggregateItemLocation.quantityOnHand = 0 OR  aggregateItemLocation.quantityOnHand IS NULL AND Item.custitem_sg_actual_available_to_build IS NULL ) THEN 0
                    WHEN ( aggregateItemLocation.quantityOnHand = 0 OR  aggregateItemLocation.quantityOnHand is NULL ) THEN Item.custitem_sg_actual_available_to_build
                    ELSE aggregateItemLocation.quantityOnHand
                END
        
            WHEN ( Item.custitem_fpe_usecount = 'T' AND Item.custitem_fpe_usemanual = 'T' AND Item.custitem_fpe_usebuildable = 'F' ) THEN
                CASE
                    WHEN (  aggregateItemLocation.quantityOnHand > Item.custitem_fpe_manualmaximum ) THEN Item.custitem_fpe_manualmaximum
                    WHEN ( aggregateItemLocation.quantityOnHand < Item.custitem_fpe_manualminimum ) THEN Item.custitem_fpe_manualminimum
                    WHEN ( aggregateItemLocation.quantityOnHand IS NULL ) THEN Item.custitem_fpe_manualminimum
                    ELSE aggregateItemLocation.quantityOnHand
                END
        
        END AS quantity
        
    FROM
        Item
        
    INNER JOIN
        aggregateItemLocation ON aggregateItemLocation.item = Item.id
        
    WHERE
        Item.custitem_sg_daily_stock_feed = 'T' AND
        Item.isinactive = 'F' AND
        aggregateItemLocation.location = 18
    `