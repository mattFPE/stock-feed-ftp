define(["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Subsidiary = exports.InvoiceForm = exports.OrderType = exports.PdfTemplateID = void 0;
    var PdfTemplateID;
    (function (PdfTemplateID) {
        PdfTemplateID[PdfTemplateID["Core_Charge_Receipt_Email_Template"] = 3] = "Core_Charge_Receipt_Email_Template";
        PdfTemplateID[PdfTemplateID["Credit-Memo_Email_Template"] = 11] = "Credit-Memo_Email_Template";
        PdfTemplateID[PdfTemplateID["Customer_Statement"] = 2] = "Customer_Statement";
        PdfTemplateID[PdfTemplateID["Estimate_Email_Template"] = 9] = "Estimate_Email_Template";
        PdfTemplateID[PdfTemplateID["Invoice_Email_Template"] = 10] = "Invoice_Email_Template";
        PdfTemplateID[PdfTemplateID["Packing_Slip_Email_Template"] = 7] = "Packing_Slip_Email_Template";
        PdfTemplateID[PdfTemplateID["PAID_Invoice_Email_Template"] = 12] = "PAID_Invoice_Email_Template";
        PdfTemplateID[PdfTemplateID["Purchase_Order_Email_Template"] = 8] = "Purchase_Order_Email_Template";
        PdfTemplateID[PdfTemplateID["Sales_Order_Email_Template"] = 6] = "Sales_Order_Email_Template";
        PdfTemplateID[PdfTemplateID["Standard_Payment_Link_Transaction_Email_Template"] = -102] = "Standard_Payment_Link_Transaction_Email_Template";
        PdfTemplateID[PdfTemplateID["Standard_Transaction_Email_Template"] = -101] = "Standard_Transaction_Email_Template";
    })(PdfTemplateID = exports.PdfTemplateID || (exports.PdfTemplateID = {}));
    var OrderType;
    (function (OrderType) {
        OrderType["DROP_SHIP"] = "1";
        OrderType["STOCKING"] = "2";
        OrderType["INSIDE_SALES"] = "3";
        OrderType["WEB_ORDER"] = "4";
        OrderType["WARRANTY"] = "5";
        OrderType["OTHER"] = "6";
    })(OrderType = exports.OrderType || (exports.OrderType = {}));
    var InvoiceForm;
    (function (InvoiceForm) {
        InvoiceForm["Fleece_Stocking_Order"] = "105";
        InvoiceForm["Fleece_Standard"] = "106";
        InvoiceForm["Fleece_Warranty"] = "128";
        InvoiceForm["Fleece_Web_Order"] = "153";
        InvoiceForm["Flex_Standard"] = "154";
    })(InvoiceForm = exports.InvoiceForm || (exports.InvoiceForm = {}));
    var Subsidiary;
    (function (Subsidiary) {
        Subsidiary["Fleece_Performance_Engineering"] = "2";
        Subsidiary["Fleece_Excavating"] = "8";
        // SB 'Fleece_Excavating' = '9'
    })(Subsidiary = exports.Subsidiary || (exports.Subsidiary = {}));
});
