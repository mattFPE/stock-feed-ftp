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
import * as search from 'N/search'
import * as runtime from 'N/runtime'
import * as format from 'N/format'

interface QueryResult {
    itemid: string,
    quantity: number
}

interface ConfigData {
    name: string
    custrecord_fpe_sftp_host: string
    custrecord_fpe_sftp_hostport: string
    custrecord_fpe_sftp_user: string
    custrecord_fpe_sftp_passguid: string
    custrecord_fpe_sftp_hostkey: string
    custrecord_fpe_sftp_directory: string
}

export const execute: EntryPoints.Scheduled.execute = (scriptContext: EntryPoints.Scheduled.executeContext) => {
    const sftpConfigIDs: string[] = (runtime.getCurrentScript().getParameter({ name: 'custscript_fpe_sftpconfid_ids'}) as string).split(',')
    const csvFolder = runtime.getCurrentScript().getParameter({ name: 'custscript_fpe_csv_folder'}) as number

    if (sftpConfigIDs.length > 0 && csvFolder) {
        try {
            const fileTimestamp = format.format({value: new Date(), type: format.Type.DATETIME}).replaceAll('/', '').replaceAll(' ', '_').replaceAll(':', '')

            let csv = 'sku,qty\n'

            const data: QueryResult[] = query.runSuiteQL({query: queryString}).asMappedResults<QueryResult>()
            log.audit('Auto FTP', 'Stock query completed')

            data.forEach(row => csv += `${row.itemid},${row.quantity}\n`)
            log.audit('Auto FTP', 'CSV data generated')

            const csvFile = file.create({
                fileType: file.Type.CSV,
                name: `FpeStockFeed_${fileTimestamp}.csv`,
                folder: csvFolder,
                contents: csv
            })

            const csvFileID = csvFile.save()
            log.audit('Auto FTP', 'CSV file created and saved')

            sftpConfigIDs.forEach(config => {
                let configData: ConfigData = search.lookupFields({
                    type: 'customrecord_fpe_sftp_config',
                    id: config,
                    columns: [ 'name', 'custrecord_fpe_sftp_host', 'custrecord_fpe_sftp_hostport', 'custrecord_fpe_sftp_user', 'custrecord_fpe_sftp_passguid', 'custrecord_fpe_sftp_hostkey', 'custrecord_fpe_sftp_directory' ]
                }) as ConfigData
                log.audit('Auto FTP', 'sFTP Connection started')

                try {
                    let transfer = sftp.createConnection({
                        url: configData.custrecord_fpe_sftp_host,
                        port: parseInt(configData.custrecord_fpe_sftp_hostport),
                        username: configData.custrecord_fpe_sftp_user,
                        passwordGuid: configData.custrecord_fpe_sftp_passguid,
                        hostKey: configData.custrecord_fpe_sftp_hostkey,
                        directory: configData.custrecord_fpe_sftp_directory
                    })
                    log.audit('Auto FTP', 'sFTP Connected')

                    transfer.upload({ file: csvFile })
                    log.audit('Auto FTP', 'File Succesfully transferred')
                } catch (connectError) {
                    log.error('Auto FTP Connection', `There was an error with the FTP connection --- ${connectError}`)
                }
            })
        } catch (error) {
            log.error('Auto FTP', `There was an error with the Auto FTP --- ${error}`)
        }
    }
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