Ext.onReady(function () {
    var win;
    var btn = Ext.get('prod_mgmt');

    btn.on('click', function () {
        //if (!win) {
        win = new Ext.Window({
            title: 'PRODUCT MANAGEMENT',
            height: 750,
            width: 1200,
            collapsible: false,
            resizable: false,
            closable: true,
            defaults: { xtype: 'tabpanel', tabPosition: 'bottom', enableScroll: true, frame: true, height: 670 },
            items: [
                {
                    activeTab: 0,
                    items: [
                        {
                            id: '',
                            title: 'STOCK PROCUREMENT',
                            defaults: { xtype: 'panel', frame: true, border: true }, layout: 'form',
                            items: [
                                {
                                    defaults: { xtype: 'panel', frame: true, border: true },
                                    items: [
                                        {
                                            title: '', height: 600, defaults: { xtype: 'panel', frame: true, border: true }, layout: 'column',
                                            items: [
                                                {
                                                    title: 'Stock Procurement', width: '50%',
                                                    defaults: { xtype: 'form', frame: false, frame: true, border: true },
                                                    items: [
                                                        {
                                                            id: 'frmProc', defaults: { xtype: 'textfield', anchor: '90%' },
                                                            items: [
                                                                { id: 'fno', fieldLabel: 'File No' },
                                                                { id: 'fname', fieldLabel: 'Proc Name' }
                                                            ],
                                                            listeners: {
                                                                'afterrender': function () {
                                                                    $.getJSON('/Helper/generateOrderNumber', { TTYPE: 'REQ' }, function (rsp) {
                                                                        if (rsp.status.toString() == "true") {
                                                                            $('#fno').val(rsp.msg.toString()).attr('readonly', true);
                                                                        }
                                                                    });
                                                                }
                                                            }
                                                        },
                                                        {
                                                            id: 'prcStk', title: 'select stock', defaults: { xtype: 'combo', mode: 'local', anchor: '90%' },
                                                            items: [
                                                                {
                                                                    id: 'prcStkn', fieldLabel: 'Stock',
                                                                    store: new Ext.data.Store({
                                                                        id: '', autoLoad: true, restful: false,
                                                                        url: '/Product/getProductCategoryList',
                                                                        reader: new Ext.data.JsonReader({ type: 'json', root: 'msg' }, [
                                                                            { name: 'Id', type: 'int' },
                                                                            { name: 'productCodeValue', type: 'string' }
                                                                        ])
                                                                    }), valueField: 'Id', displayField: 'productCodeValue', forceSelection: true, typeAhead: true, allowBlank: false
                                                                },
                                                                {
                                                                    id: 'pCat', fieldLabel: 'Parent Category',
                                                                    store: new Ext.data.Store({
                                                                        autoLoad: true, restful: false,
                                                                        url: '/Product/getCategoryList', root: 'msg',
                                                                        reader: new Ext.data.JsonReader({ type: 'json', root: 'msg' }, [
                                                                            { name: 'Id', type: 'int' },
                                                                            { name: 'categoryValue', type: 'string' }
                                                                        ])
                                                                    }), valueField: 'Id', displayField: 'categoryValue', forceSelection: true, typeAhead: true, allowBlank: false
                                                                },
                                                                {
                                                                    id: 'mtrx', fieldLabel: 'Metrics',
                                                                    store: new Ext.data.Store({
                                                                        autoLoad: true, restful: false,
                                                                        url: '/Helper/getMetrics',
                                                                        reader: new Ext.data.JsonReader({}, [
                                                                            { name: 'Id', type: 'int' },
                                                                            { name: 'metric_name', type: 'string' }
                                                                        ])
                                                                    }), valueField: 'Id', displayField: 'metric_name', forceSelection: true, typeAhead: true, allowBlank: false
                                                                }
                                                            ]
                                                        },
                                                        {
                                                            id: 'prcFigures', defaults: { xtype: 'numberfield', anchor: '90%' },
                                                            items: [
                                                                { xtype: 'numberfield', fieldLabel: 'Qty Requested', id: 'qtr' },
                                                                { xtype: 'numberfield', id: 'qtysp', fieldLabel: 'Qty Supplied' },
                                                                { xtype: 'datefield', fieldLabel: 'Date Requested', id: 'dtr' },
                                                                { xtype: 'datefield', fieldLabel: 'Date Supplied', id: 'dts' },
                                                                { xtype: 'numberfield', fieldLabel: 'Market Price', id: 'cP' },
                                                                { xtype: 'numberfield', fieldLabel: 'Prev Unit Price', id: 'pvP' },
                                                                { xtype: 'numberfield', id: 'negP', fieldLabel: 'Negotiated Price' }
                                                            ]
                                                        },
                                                        {
                                                            id: 'prcSup', title: 'Supplier', defaults: { xtype: 'combo', mode: 'local', anchor: '90%' },
                                                            items: [
                                                                {
                                                                    id: 'cboPrcSup', fieldLabel: 'Supplier',
                                                                    store: new Ext.data.Store({
                                                                        id: '', autoLoad: true, restful: false,
                                                                        url: '/Supplier/getSupplierList',
                                                                        reader: new Ext.data.JsonReader({ type: 'json', root: 'msg' }, [
                                                                            { name: 'Id', type: 'int' },
                                                                            { name: 'sup_name', type: 'string' }
                                                                        ])
                                                                    }), valueField: 'Id', displayField: 'sup_name', forceSelection: true, typeAhead: true, allowBlank: false
                                                                }
                                                            ],
                                                            buttons: [
                                                                {
                                                                    id: 'procBtnAdd', text: 'Add Stock',
                                                                    listeners: {
                                                                        'click': function (btn) {
                                                                            var procF = Ext.getCmp('frmProc').getForm();
                                                                            var stkF = Ext.getCmp('prcStk').getForm();
                                                                            var figF = Ext.getCmp('prcFigures').getForm();
                                                                            var supF = Ext.getCmp('prcSup').getForm();

                                                                            if (procF.isValid() && stkF.isValid() && figF.isValid() && supF.isValid()) {
                                                                                $.post('/Product/addStockReportItem',
                                                                                    {
                                                                                        description: Ext.fly('prcStkn').getValue() + ' @ ' + Ext.fly('negP').getValue() + 'Ghc', unitOfStock: Ext.fly('qtysp').getValue(),
                                                                                        fno: Ext.fly('fno').getValue(), fname: Ext.fly('fname').getValue(), stk: Ext.fly('prcStkn').getValue(),
                                                                                        pCat: Ext.fly('pCat').getValue(), metrx: Ext.fly('mtrx').getValue(), qtyR: parseInt(Ext.fly('qtr').getValue()),
                                                                                        dteR: Ext.fly('dtr').getValue(), dteS: Ext.fly('dts').getValue(), curP: Ext.fly('cP').getValue(),
                                                                                        prevP: Ext.fly('pvP').getValue(), negP: Ext.fly('negP').getValue(), sup: Ext.fly('cboPrcSup').getValue()
                                                                                    },
                                                                                    function (rs) {
                                                                                        if (rs.status.toString() == "true") {
                                                                                            $('#fno').attr('readonly', 'readonly');
                                                                                            var k = [];
                                                                                            $.each(rs.msg, function (i, d) {
                                                                                                k[i] = [d.Id, d.narration, d.unit.toString(), d.QtyByPrice];
                                                                                            });
                                                                                            Ext.getCmp('grdPList').getStore().loadData(k);
                                                                                            $('#procBtnClr').trigger('click');
                                                                                        }
                                                                                    }, "json");
                                                                            }
                                                                        }
                                                                    }
                                                                },
                                                                {
                                                                    id: 'procBtnClr', text: 'Clear Stock',
                                                                    listeners: {
                                                                        'click': function (btn) {
                                                                            Ext.getCmp('prcStk').getForm().reset();
                                                                            Ext.getCmp('prcFigures').getForm().reset();
                                                                            Ext.getCmp('prcSup').getForm().reset();

                                                                            $('#cboPrcSup').focus();
                                                                        }
                                                                    }
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                },
                                                {
                                                    title: 'Stock List', defaults: { xtype: 'form', border: true }, width: '50%', layout: 'form',
                                                    items: [
                                                        new Ext.grid.GridPanel({
                                                            id: 'grdPList', title: '', height: 370, autoScroll: true,
                                                            store: new Ext.data.GroupingStore({
                                                                reader: new Ext.data.ArrayReader({}, [
                                                                    { name: 'Id', type: 'int' },
                                                                    { name: 'narration', type: 'string' },
                                                                    { name: 'unit', type: 'string' },
                                                                    { name: 'QtyByPrice', type: 'string' }
                                                                ]),
                                                                sortInfo: {
                                                                    field: "Id",
                                                                    direction: "ASC"
                                                                },
                                                                groupField: "Id"
                                                            }),
                                                            columns: [
                                                                { id: 'Id', header: 'ID', width: 25, hidden: true, sortable: true, dataIndex: 'Id' },
                                                                 { id: 'narration', header: 'NARRATION', width: 250, hidden: false, sortable: true, dataIndex: 'narration' },
                                                                 { id: 'unit', header: 'QTY', width: 60, hidden: false, sortable: true, dataIndex: 'unit' },
                                                                 { id: 'QtyByPrice', header: 'TOTAL SUM', width: 200, hidden: false, sortable: true, dataIndex: 'QtyByPrice' }
                                                            ], stripeRows: true
                                                        })
                                                    ]
                                                },
                                                {
                                                    title: 'Actions',
                                                    items: [],
                                                    buttons: [
                                                        {
                                                            text: 'Save Stock Details',
                                                            id: 'procBtnSaveStock',
                                                            listeners: {
                                                                'click': function (btn) {
                                                                    if (Ext.getCmp('grdPList').getStore().getCount() > 0) {
                                                                        $.post('/Product/saveStockReportItems', {}, function (stat) {
                                                                            if (stat.status.toString() == "true") {
                                                                                Ext.Msg.alert('STOCK LIST', stat.msg.toString(), this);
                                                                                $('#fno').attr('readonly', false);
                                                                            }
                                                                        }, "json");
                                                                    }
                                                                }
                                                            }
                                                        },
                                                        {
                                                            tpl: new Ext.XTemplate('<a id="aLPO" style="display:none" href="{path}">Local Purchase Order(PDF)</a>'), compiled: !0, data: {
                                                                path: "/Notification/GenerateLPO"
                                                            }
                                                        },
                                                        {
                                                            id: '', text: 'Generate LPO',
                                                            listeners: {
                                                                'click': function (btn) {
                                                                    if (Ext.getCmp('grdPList').getStore().getCount() > 0) {
                                                                        $.getJSON('/Product/generateLPO', {}, function (rsp) {
                                                                            console.log(rsp.status.toString());
                                                                        });
                                                                    }
                                                                    else {
                                                                        Ext.Msg.alert('GENERATE LPO: NO DATA', 'No data exist for the generation of LPO', this);
                                                                    }
                                                                }
                                                            }
                                                        },
                                                        {
                                                            text: 'Clear Form',
                                                            id: 'procBtnClearForm',
                                                            listeners: {
                                                                'click': function (btn) {
                                                                    $.post('/Product/clearStockReportItem', {}, function (rs) {
                                                                        if (rs.status.toString() == "true") {
                                                                            Ext.getCmp('frmProc').getForm().reset();
                                                                            Ext.getCmp('prcStk').getForm().reset();
                                                                            Ext.getCmp('prcFigures').getForm().reset();
                                                                            Ext.getCmp('prcSup').getForm().reset();

                                                                            Ext.getCmp('grdPList').getStore().removeAll();

                                                                            $('#prcStkn').focus();
                                                                        }
                                                                    }, "json");
                                                                }
                                                            }
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    title: 'Supplier List', height: 200, defaults: { xtype: 'form', frame: true, border: true },
                                    items: [
                                        new Ext.grid.GridPanel({
                                            id: '', title: '', height: 185, autoScroll: true,
                                            store: new Ext.data.GroupingStore({
                                                reader: new Ext.data.ArrayReader({}, [
                                                    { name: 'id', type: 'int' },
                                                    { name: 'code', type: 'string' },
                                                    { name: 'product', type: 'string' },
                                                    { name: 'qtyreq', type: 'int' },
                                                    { name: 'qtysup', type: 'int' },
                                                    { name: 'dtereq', type: 'string' },
                                                    { name: 'dtesup', type: 'string' },
                                                    { name: 'unitP', type: 'int' },
                                                    { name: 'prevP', type: 'int' }
                                                ]),
                                                sortInfo: {
                                                    field: "id",
                                                    direction: "ASC"
                                                },
                                                groupField: "code"
                                            }),
                                            columns: [
                                                 { id: 'id', header: 'ID', width: 60, hidden: false, sortable: true, dataIndex: 'id' },
                                                 { id: 'code', header: 'CODE', width: 60, hidden: false, sortable: true, dataIndex: 'code' },
                                                 { id: 'product', header: 'PRODUCT', width: 200, hidden: false, sortable: true, dataIndex: 'product' },
                                                 { id: 'qtyreq', header: 'QTY REQ', width: 100, hidden: false, sortable: true, dataIndex: 'qtyreq' },
                                                 { id: 'qtysup', header: 'QTY SUP', width: 100, hidden: false, sortable: true, dataIndex: 'qtysup' },
                                                 { id: 'dtereq', header: 'DTE REQ', width: 80, hidden: false, sortable: true, dataIndex: 'dtereq' },
                                                 { id: 'dtesup', header: 'DTE SUP', width: 90, hidden: false, sortable: true, dataIndex: 'dtesup' },
                                                 { id: 'unitP', header: 'UNIT PRICE', width: 80, hidden: false, sortable: true, dataIndex: 'unitP' },
                                                 { id: 'prevP', header: 'PREVIOUS PRICE', width: 80, hidden: false, sortable: true, dataIndex: 'prevP' },
                                            ]
                                        })
                                    ],
                                    buttons: [
                                        {
                                            text: 'Delete'
                                        }
                                    ]
                                }
                            ]
                        }
                        /*
                        , {
                            id: '',
                            title: 'STOCK RECEIVED',
                            defaults: { xtype: 'panel', frame: true }, layout: 'form',
                            items: [
                                {
                                    id: '', title: 'FORM::ISSUE STOCK', height: 400, defaults: { xtype: 'form', frame: true, border: true }, layout: 'column',
                                    items: [
                                        {
                                            title: '', width: '50%', defaults: { xtype: 'numberfield', anchor: '95%' },
                                            items: [
                                                {
                                                    xtype: 'combo', id: '', fieldLabel: 'Stock', typeAhead: true, forceSelection: true, mode: 'remote',
                                                    store: []
                                                },
                                                { id: '', fieldLabel: 'Bin Qty' },
                                                { id: '', fieldLabel: 'Unit Price' },
                                                { xtype: 'datefield', id: '', fieldLabel: 'Date dispatched' },
                                                { id: '', fieldLabel: 'Qty Issued' },
                                                { id: '', fieldLabel: 'Issued @ Price' },
                                                { xtype: 'combo', id: '', fieldLabel: 'Dept/Branch' }
                                            ],
                                            buttons: [
                                                { text: 'Save' },
                                                { text: 'Clear' },
                                                { text: 'Close' }
                                            ]
                                        },
                                        {
                                            title: 'Department Requests', width: '50%', height: 380, defaults: { xtype: 'textarea' }, frame: true, border: true, layout: 'fit',
                                            items: [
                                                { id: '' }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    id: '', title: 'Stock List',
                                    items: [
                                        new Ext.grid.GridPanel({
                                            id: '', title: '', height: 185, autoScroll: true,
                                            store: new Ext.data.GroupingStore({
                                                reader: new Ext.data.ArrayReader({}, [
                                                    { name: 'id', type: 'int' },
                                                    { name: 'product', type: 'string' },
                                                    { name: 'qtyreq', type: 'int' },
                                                    { name: 'dtedisp', type: 'string' },
                                                    { name: 'unitP', type: 'int' },
                                                    { name: 'bUnit', type: 'int' }
                                                ]),
                                                sortInfo: {
                                                    field: "id",
                                                    direction: "ASC"
                                                },
                                                groupField: "code"
                                            }),
                                            columns: [
                                                 { id: 'id', header: 'ID', width: 60, hidden: false, sortable: true, dataIndex: 'id' },
                                                 { id: 'product', header: 'PRODUCT', width: 250, hidden: false, sortable: true, dataIndex: 'product' },
                                                 { id: 'qtyreq', header: 'QTY REQ', width: 100, hidden: false, sortable: true, dataIndex: 'qtyreq' },
                                                 { id: 'dtedisp', header: 'QTY SUP', width: 100, hidden: false, sortable: true, dataIndex: 'dtedisp' },
                                                 { id: 'unitP', header: 'UNIT PRICE', width: 80, hidden: false, sortable: true, dataIndex: 'unitP' },
                                                 { id: 'bUnit', header: 'BUSINESS UNIT', width: 250, hidden: false, sortable: true, dataIndex: 'prevP' },
                                            ]
                                        })
                                    ]
                                }
                            ]
                        },//END OF STOCK DISBURSEMENT
                        {
                            title: 'testing One', defaults: { xtype: 'panel', frame: true, border: true }, layout: 'column',
                            items: [
                                {
                                    title: 'Panel 1', columnWidth: .5, defaults: { xtype: 'form', frame: true, border: true },
                                    items: [
                                        {
                                            id: '', title: 'Stock Procurement 2', defaults: { xtype: 'textfield', anchor: '90%', allowBlank: false },
                                            items: [
                                                { id: '', fieldLabel: 'File No' },
                                                { id: '', fieldLabel: 'Proc Name' }
                                            ]
                                        },
                                        {
                                            id: '', title: 'select stock 2', defaults: { xtype: 'combo', anchor: '90%' },
                                            items: [
                                                {
                                                    id: '', fieldLabel: 'Parent Category',
                                                    store: new Ext.data.Store({
                                                        autoLoad: true, restful: false,
                                                        url: '/Product/getCategoryList', root: 'msg',
                                                        reader: new Ext.data.JsonReader({ type: 'json', root: 'msg' }, [
                                                            { name: 'Id', type: 'int' },
                                                            { name: 'categoryValue', type: 'string' }
                                                        ])
                                                    }), valueField: 'Id', displayField: 'categoryValue', forceSelection: true, typeAhead: true, allowBlank: false
                                                }
                                            ]
                                        },
                                        {
                                            id: '', title: 'Prod List 2',
                                            items: [
                                                new Ext.grid.GridPanel({
                                                    id: '', title: '', height: 300, autoScroll: true,
                                                    store: new Ext.data.GroupingStore({
                                                        reader: new Ext.data.ArrayReader({}, [
                                                            { name: 'Id', type: 'int' },
                                                            { name: 'narration', type: 'string' },
                                                            { name: 'unit', type: 'string' },
                                                            { name: 'QtyByPrice', type: 'string' }
                                                        ]),
                                                        sortInfo: {
                                                            field: "Id",
                                                            direction: "ASC"
                                                        },
                                                        groupField: "Id"
                                                    }),
                                                    columns: [
                                                        { id: 'Id', header: 'ID', width: 25, hidden: true, sortable: true, dataIndex: 'Id' },
                                                         { id: 'narration', header: 'NARRATION', width: 250, hidden: false, sortable: true, dataIndex: 'narration' },
                                                         { id: 'unit', header: 'QTY', width: 60, hidden: false, sortable: true, dataIndex: 'unit' },
                                                         { id: 'QtyByPrice', header: 'TOTAL SUM', width: 200, hidden: false, sortable: true, dataIndex: 'QtyByPrice' }
                                                    ], stripeRows: true
                                                })
                                            ],
                                            buttons: [
                                                { text: 'Add Stock' }, { text: 'Clear Stock' }
                                            ]
                                        },
                                        {
                                            title: 'Supplier 2', defaults: { xtype: 'combo', anchor: '90%' },
                                            items: [
                                                {
                                                    id: '', fieldLabel: 'Supplier',
                                                    store: new Ext.data.Store({
                                                        id: '', autoLoad: true, restful: false,
                                                        url: '/Supplier/getSupplierList',
                                                        reader: new Ext.data.JsonReader({ type: 'json', root: 'msg' }, [
                                                            { name: 'Id', type: 'int' },
                                                            { name: 'sup_name', type: 'string' }
                                                        ])
                                                    }), valueField: 'Id', displayField: 'sup_name', forceSelection: true, typeAhead: true, allowBlank: false
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    title: 'Stock List 2', columnWidth: .5, defaults: { xtype: 'form', frame: true, border: true },
                                    items: [
                                        {
                                            id: '',
                                            items: [
                                                new Ext.grid.GridPanel({
                                                    id: 'grdPList', title: '', height: 300, autoScroll: true,
                                                    store: new Ext.data.GroupingStore({
                                                        reader: new Ext.data.ArrayReader({}, [
                                                            { name: 'Id', type: 'int' },
                                                            { name: 'narration', type: 'string' },
                                                            { name: 'unit', type: 'string' },
                                                            { name: 'QtyByPrice', type: 'string' }
                                                        ]),
                                                        sortInfo: {
                                                            field: "Id",
                                                            direction: "ASC"
                                                        },
                                                        groupField: "Id"
                                                    }),
                                                    columns: [
                                                        { id: 'Id', header: 'ID', width: 25, hidden: true, sortable: true, dataIndex: 'Id' },
                                                         { id: 'narration', header: 'NARRATION', width: 250, hidden: false, sortable: true, dataIndex: 'narration' },
                                                         { id: 'unit', header: 'QTY', width: 60, hidden: false, sortable: true, dataIndex: 'unit' },
                                                         { id: 'QtyByPrice', header: 'TOTAL SUM', width: 200, hidden: false, sortable: true, dataIndex: 'QtyByPrice' }
                                                    ], stripeRows: true
                                                })
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }//END OF TESTING ONE
                        */
                    ]
                }
            ]
        }).show();
        //}
        //win.show();
    });
});