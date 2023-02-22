export enum PdfTemplateID {
    "Core_Charge_Receipt_Email_Template" = 3,
    "Credit-Memo_Email_Template" = 11,
    "Customer_Statement" = 2,
    "Estimate_Email_Template" = 9,
    "Invoice_Email_Template" = 10,
    "Packing_Slip_Email_Template" = 7,
    "PAID_Invoice_Email_Template" = 12,
    "Purchase_Order_Email_Template" = 8,
    "Sales_Order_Email_Template" = 6,
    "Standard_Payment_Link_Transaction_Email_Template" = -102,
    "Standard_Transaction_Email_Template" = -101
}

export enum OrderType {
    'DROP_SHIP' = '1',
    'STOCKING' = '2',
    'INSIDE_SALES' = '3',
    'WEB_ORDER' = '4',
    'WARRANTY' = '5',
    'OTHER' = '6'
}

export enum InvoiceForm {
    'Fleece_Stocking_Order' = '105',
    'Fleece_Standard' = '106',
    'Fleece_Warranty' = '128',
    'Fleece_Web_Order' = '153',
    'Flex_Standard' = '154'
}

export enum Subsidiary {
    'Fleece_Performance_Engineering' = '2',
    'Fleece_Excavating' = '8',
    // SB 'Fleece_Excavating' = '9'
}