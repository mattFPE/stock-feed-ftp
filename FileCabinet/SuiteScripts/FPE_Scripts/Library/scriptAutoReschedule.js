/**
 * Author: Matt Carter
 * Description: Utility script that will automatically redeploy a scheduled or map/reduce script if the governance is
 * getting low.
 *
 * @NApiVersion 2.1
 */
define(["require", "exports", "N/runtime", "N/task", "N/log"], function (require, exports, runtime, task, log) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = (scriptType, governanceLimit = 1800) => {
        const currentScript = runtime.getCurrentScript();
        const currentGovernance = currentScript.getRemainingUsage();
        if (currentGovernance < governanceLimit) {
            log.audit('Governance & Rescheduling', 'Governance is getting low, rescheduling script');
            const rescheduledScript = task.create({
                // @ts-ignore
                taskType: scriptType,
                scriptId: currentScript.id,
                deploymentId: currentScript.deploymentId
            });
            rescheduledScript.submit();
            return true;
        }
        else {
            return false;
        }
    };
});
