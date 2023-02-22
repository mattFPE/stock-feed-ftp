/**
 * Author: Matt Carter
 * Description: Utility script that will automatically redeploy a scheduled or map/reduce script if the governance is
 * getting low.
 *
 * @NApiVersion 2.1
 */

import * as runtime from 'N/runtime'
import * as task from 'N/task'
import * as log from 'N/log'

export default (scriptType: task.TaskType | string, governanceLimit: number = 1800): boolean => {
    const currentScript = runtime.getCurrentScript()
    const currentGovernance = currentScript.getRemainingUsage()

    if (currentGovernance < governanceLimit) {
        log.audit('Governance & Rescheduling', 'Governance is getting low, rescheduling script')

        const rescheduledScript = task.create({
            // @ts-ignore
            taskType: scriptType,
            scriptId: currentScript.id,
            deploymentId: currentScript.deploymentId
        })

        rescheduledScript.submit()

        return true
    } else {
        return false
    }
}