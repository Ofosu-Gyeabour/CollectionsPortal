Ext.onReady(function () {

    var uniqueDta = [];

    var getUniqueDisbursements = function (k) {
        uniqueDta.length = 0;
        $.getJSON('/Helper/getUniqueDisbursements', {}, function (r) {
            if (r.status.toString() == "true") {
                $.each(r.msg, function (i,d) {
                    uniqueDta[i] = [d.Id, d.disbursementNo];
                });

                k.getStore().loadData(uniqueDta);
            }
        });
    }

    var getUniqueBranchDisbursements = function (k, selID) {
        
        uniqueDta.length = 0;
        k.getStore().removeAll();
        $.getJSON('/Helper/getUniqueBranchDisbursements', {bId:selID}, function (r) {
            if (r.status.toString() == "true") {
                $.each(r.msg, function (i, d) {
                    uniqueDta[i] = [d.Id, d.disbursementNo];
                });

                k.getStore().loadData(uniqueDta);
            }
        });
    }

    var getBINCards = function (k,f,t,id) {
        var dx = [];
        console.log(k);
        $.getJSON('/Helper/getBINCardRecords', {df:f,dt:t,BID:id}, function (rs) {
            if (rs.status.toString() == "true") {
                $.each(rs.msg, function (i, d) {
                    dx[i] = [d.Id, d.objProduct.product_name,d.quantity,d.quantityLeft,d.drawDate,d.metaData];
                });

                console.log(dx);
                k.getStore().loadData(dx);
            }
        });
    }
    
    var getStoreJournalRecords = function (k, f, t, b_id) {
        var jarr = [];
        $.getJSON('/Helper/getStoreJournalRecords', { df: f, dt: t, BID: b_id }, function (r) {
            if (r.status.toString() == "true") {
                $.each(r.msg, function (i, d) {
                    jarr[i] = [d.Id, d.sDte, d.objBranch.branchName, d.accountNo, d.accountName, d.debitLeg, d.creditLeg, d.narration, d.objBranch.mnemonic];
                });

                console.log(jarr);
                k.getStore().loadData(jarr);
            }
        });
    }

    var numberWithCommas = function(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    var bt = Ext.get('rpt_mod');

    bt.on('click', function () {
        var rWindow = Ext.getCmp('rptWindow');
        if (!rWindow) {
            rWindow = new Ext.Window({
                id: 'rptWindow',
                title: 'REPORTING MODULE',
                height: 800,
                width: 1200,
                closable: true,
                defaults: { xtype: 'tabpanel', tabPosition: 'bottom', enableScroll: true, frame: true, border: true },
                items: [
                    {
                        activeTab: 0,
                        items: [
                            {
                                id: 'stkIssueRpt',
                                title: 'STOCK ISSUE REPORTS',
                                defaults: { xtype: 'panel', frame: true, border: true }, layout: 'column',
                                items: [
                                    {
                                        id: '', title: '', columnWidth: .3, height: 650, defaults: { xtype: 'form', frame: true, border: true }, layout: 'form',
                                        items: [
                                            {
                                                id: '',title: 'filter for branch or department disbursements', defaults: { xtype: 'combo', forceSelection: true, typeAhead: true, mode: 'local', anchor: '90%' }, layout:'fit',
                                                items: [
                                                    {
                                                        id: 'cboRptDept', 
                                                        store: new Ext.data.Store({
                                                            autoLoad: true, restful: false,
                                                            url: '/Helper/getDepartmentList',
                                                            reader: new Ext.data.JsonReader({root: 'msg'}, [
                                                                { name: 'Id', type: 'int' },
                                                                { name: 'branchName', type: 'string' }
                                                            ])
                                                        }), valueField: 'Id', displayField: 'branchName',
                                                        listeners: {
                                                            'select': function () {
                                                                if (Ext.getCmp('grdStkIssueRpt').getStore().getCount() > 0) {
                                                                    getUniqueBranchDisbursements(Ext.getCmp('grdStkIssueRpt'), Ext.getCmp('cboRptDept').getValue());
                                                                    Ext.getCmp('grdStkIssueRptDetails').getStore().removeAll();
                                                                }
                                                                else {
                                                                    getUniqueDisbursements(Ext.getCmp('grdStkIssueRpt'));
                                                                    Ext.getCmp('grdStkIssueRptDetails').getStore().removeAll();
                                                                }
                                                            }
                                                        }
                                                    }
                                                ]
                                            },
                                            {
                                                id: '',
                                                items: [
                                                    new Ext.grid.GridPanel({
                                                        id: 'grdStkIssueRpt', title: '', height: 500, autoScroll: true, autoExpandColumn: 'disbursementNo',
                                                        store: new Ext.data.GroupingStore({
                                                            reader: new Ext.data.ArrayReader({}, [
                                                                { name: 'Id', type: 'int' },
                                                                { name: 'disbursementNo', type: 'string' }
                                                            ]),
                                                            sortInfo: {
                                                                field: "Id",
                                                                direction: "ASC"
                                                            },
                                                            groupField: "Id"
                                                        }),
                                                        columns: [
                                                             { id: 'Id', header: 'ID', width: 25, hidden: true, sortable: true, dataIndex: 'Id' },
                                                             { id: 'disbursementNo', header: 'PRODUCT', width: 200, hidden: false, sortable: true, dataIndex: 'disbursementNo' }
                                                        ], stripeRows: true,
                                                        viewConfig: {
                                                            getRowClass: function (record, rowIndex, rowParams, store) {
                                                                return ((rowIndex % 2) == 0) ? "even-class" : "odd-class";
                                                            }
                                                        },
                                                        listeners: {
                                                            'render': function () {
                                                                
                                                                getUniqueDisbursements(Ext.getCmp('grdStkIssueRpt'));
                                                            },
                                                            'afterrender': function () {
                                                                setInterval(function () {
                                                                    $('#cboRptDept').val('').focus();
                                                                    getUniqueDisbursements(Ext.getCmp('grdStkIssueRpt'));
                                                                }, 60000);
                                                            },
                                                            'rowdblclick': function (e, t) {
                                                                var xdf = [];
                                                                var rec = e.getStore().getAt(t);
                                                                $.getJSON('/Helper/getDisbursementDetails', {d: rec.get('disbursementNo')}, function (rs) {
                                                                    if (rs.status.toString() == "true") {
                                                                        $.each(rs.msg, function (i, d) {
                                                                            xdf[i] = [d.Id,d.product,d.category,d.productCode,d.quantity,d.price,d.resultant,d.branchCode,d.internalAccount];
                                                                        });

                                                                        Ext.getCmp('grdStkIssueRptDetails').getStore().loadData(xdf);
                                                                    }
                                                                });
                                                            }
                                                        }
                                                    })
                                                ],
                                                buttons: [
                                                    {
                                                        id: '', text: 'Refresh',
                                                        listeners: {
                                                            'click': function (btn) {
                                                                $('#cboRptDept').val('');
                                                                Ext.getCmp('grdStkIssueRptDetails').getStore().removeAll();
                                                                getUniqueDisbursements(Ext.getCmp('grdStkIssueRpt'));
                                                            }
                                                        }
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        id: '', title: '', columnWidth: .7, height: 650, defaults: { xtype: 'form', frame: true, border: true },
                                        items: [
                                            {
                                                id: '',
                                                items: [
                                                    new Ext.grid.GridPanel({
                                                        id: 'grdStkIssueRptDetails', title: '', height: 500, autoScroll: true, autoExpandColumn: 'product_name',
                                                        store: new Ext.data.GroupingStore({
                                                            reader: new Ext.data.ArrayReader({}, [
                                                                { name: 'Id', type: 'int' },
                                                                { name: 'product_name', type: 'string' },
                                                                { name: 'categoryValue', type: 'string' },
                                                                { name: 'productCode', type: 'string' },
                                                                { name: 'qty', type: 'string' },
                                                                { name: 'price', type: 'string' },
                                                                { name: 'result', type: 'string' },
                                                                { name: 'branchId', type: 'string' },
                                                                { name: 'intAccnt', type: 'string' }
                                                            ]),
                                                            sortInfo: {
                                                                field: "Id",
                                                                direction: "ASC"
                                                            },
                                                            groupField: "Id"
                                                        }),
                                                        columns: [
                                                             { id: 'Id', header: 'ID', width: 25, hidden: true, sortable: true, dataIndex: 'Id' },
                                                             { id: 'product_name', header: 'PRODUCT', width: 200, hidden: false, sortable: true, dataIndex: 'product_name' },
                                                             { id: 'categoryValue', header: 'CATEGORY', width: 200, hidden: false, sortable: true, dataIndex: 'categoryValue' },
                                                             { id: 'productCode', header: 'STOCK CODE', width: 200, hidden: false, sortable: true, dataIndex: 'productCode' },
                                                             { id: 'qty', header: 'QTY', width: 200, hidden: false, sortable: true, dataIndex: 'qty' },
                                                             { id: 'price', header: 'UNIT PRICE', width: 200, hidden: false, sortable: true, dataIndex: 'price' },
                                                             { id: 'result', header: 'VALUE', width: 200, hidden: false, sortable: true, dataIndex: 'result' },
                                                             { id: 'branchId', header: 'BRANCHID', width: 200, hidden: false, sortable: true, dataIndex: 'branchId' },
                                                             { id: 'intAccnt', header: 'ACCOUNT', width: 200, hidden: false, sortable: true, dataIndex: 'intAccnt' },
                                                        ], stripeRows: true,
                                                        viewConfig: {
                                                            getRowClass: function (record, rowIndex, rowParams, store) {
                                                                return ((rowIndex % 2) == 0) ? "even-class" : "odd-class";
                                                            }
                                                        }
                                                    })
                                                ]
                                            }
                                        ],
                                        buttons: [
                                            {
                                                tpl: new Ext.XTemplate('<a id="atRPT" style="display:none" href="{path}">Disbursement Report (xlsx)</a>'), compiled: !0, data: {
                                                    path: "/Notification/DisbursementExcelReport"
                                                }
                                                , autoScroll: !0
                                            },
                                            {
                                                id: '', text: 'Print (CSV)',
                                                listeners: {
                                                    'click': function (btn) {
                                                        if (Ext.getCmp('grdStkIssueRptDetails').getStore().getCount() > 0) {
                                                            window.open(document.getElementById("atRPT").href, "_blank")
                                                        }
                                                    }
                                                }
                                            },
                                            {
                                                tpl: new Ext.XTemplate('<a id="atRPTPdF" style="display:none" href="{path}">Stock Issue Report(pdf)</a>'), compiled: !0, data: {
                                                    path: "/Notification/PrintStockReport"
                                                }
                                                , autoScroll: !0
                                            },
                                            {
                                                id: '', text: 'Print (PDF)',
                                                listeners: {
                                                    'click': function (btn) {
                                                        if (Ext.getCmp('grdStkIssueRptDetails').getStore().getCount() > 0) {
                                                            window.open(document.getElementById("atRPTPdF").href, "_blank")
                                                        }
                                                    }
                                                }
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                id: '', title: 'BIN CARD REPORT', defaults: { xtype: 'panel' }, layout: 'column',
                                items: [
                                    {
                                        columnWidth: .3, defaults: { xtype: 'form', frame: true, border: true },height:650,
                                        items: [
                                            {
                                                id: '', title: 'filter for branch or department BIN card', defaults: { xtype: 'combo', forceSelection: true, typeAhead: true, mode: 'local', anchor: '90%' },layout: 'fit',
                                                items: [
                                                    {
                                                        id: 'binCboDept',
                                                        store: new Ext.data.Store({
                                                            autoLoad: true, restful: false,
                                                            url: '/Helper/getDepartmentList',
                                                            reader: new Ext.data.JsonReader({ root: 'msg' }, [
                                                                { name: 'Id', type: 'int' },
                                                                { name: 'branchName', type: 'string' }
                                                            ])
                                                        }), valueField: 'Id', displayField: 'branchName',
                                                        listeners: {
                                                            'select': function () {
                                                                /*
                                                                $.getJSON('/Helper/getBINCardRecordsUsingBranch', { BID: Ext.getCmp('binCboDept').getValue() }, function (ds) {
                                                                    if (ds.status.toString() == "true") {
                                                                        var ar = [];
                                                                        $.each(ds.msg, function (i, d) {
                                                                            ar[i] = [d.Id, d.drawdownNo];
                                                                        });

                                                                        Ext.getCmp('grdBinCard').getStore().loadData(ar);
                                                                    }
                                                                });
                                                                */
                                                            }
                                                        }
                                                    }
                                                ]
                                            },
                                            {
                                                id: '', title: 'Period From', defaults: { xtype: 'datefield', anchor: '90%', format: 'd/m/Y' },layout: 'fit',
                                                items: [
                                                    { id: 'BinDtF' }
                                                ]
                                            },
                                            {
                                                id: '', title: 'Period To', defaults: { xtype: 'datefield', anchor: '90%', format: 'd/m/Y' },layout: 'fit',
                                                items: [
                                                    {id: 'BinDtT'}
                                                ],
                                                buttons: [
                                                    {
                                                        id: '', text: 'Fetch Results',
                                                        listeners: {
                                                            'click': function (btn) {
                                                                getBINCards(Ext.getCmp('grdBinCardData'), Ext.fly('BinDtF').getValue(), Ext.fly('BinDtT').getValue(),Ext.getCmp('binCboDept').getValue());
                                                            }
                                                        }
                                                    }
                                                ]
                                            },
                                            {
                                                id: '',height: 550,title: 'Put a graph here',
                                                items: [
                                                    
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        columnWidth: .7, defaults: { xtype: 'form', frame: true, border: true },
                                        items: [
                                            {
                                                id: '', title: 'Bin Card Data', height: 500,
                                                items: [
                                                    new Ext.grid.GridPanel({
                                                        id: 'grdBinCardData', title: 'Bin Cards', height: 400, autoScroll: true, autoExpandColumn: 'product_name',
                                                        store: new Ext.data.GroupingStore({
                                                            reader: new Ext.data.ArrayReader({}, [
                                                                { name: 'Id', type: 'int'},
                                                                { name: 'product_name', type: 'string' },
                                                                { name: 'quantity', type: 'string' },
                                                                { name: 'quantityLeft', type: 'string' },
                                                                { name: 'drawDate', type: 'string' },
                                                                { name: 'metaData', type: 'string' }
                                                            ]),
                                                            sortInfo: {
                                                                field: "Id",
                                                                direction: "ASC"
                                                            },
                                                            groupField: "Id"
                                                        }),
                                                        columns: [
                                                             { id: 'Id', header: 'ID', width: 25, hidden: true, sortable: true, dataIndex: 'Id' },
                                                             { id: 'product_name', header: 'PRODUCT', width: 200, hidden: false, sortable: true, dataIndex: 'product_name' },
                                                             { id: 'quantity', header: 'QTY', width: 100, hidden: false, sortable: true, dataIndex: 'quantity' },
                                                             { id: 'quantityLeft', header: 'QTY_LEFT', width: 100, hidden: false, sortable: true, dataIndex: 'quantityLeft' },
                                                             { id: 'drawDate', header: 'DATE', width: 100, hidden: false, sortable: true, dataIndex: 'drawDate' },
                                                             { id: 'metaData', header: 'USER', width: 200, hidden: false, sortable: true, dataIndex: 'metaData' }
                                                        ], stripeRows: true,
                                                        viewConfig: {
                                                            getRowClass: function (record, rowIndex, rowParams, store) {
                                                                return ((rowIndex % 2) == 0) ? "even-class" : "odd-class";
                                                            }
                                                        }
                                                    })
                                                ],
                                                buttons: [
                                                    {
                                                        tpl: new Ext.XTemplate('<a id="arptCsv" style="display:none" href="{path}">Stock Control List</a>'), compiled: !0, data: {
                                                            path: "/Notification/BINCardData"
                                                        }
                                                    },
                                                    {
                                                        id: '', text: 'Download CSV',
                                                        listeners: {
                                                            'click': function (btn) {
                                                                if (Ext.getCmp('grdBinCardData').getStore().getCount() > 0) {
                                                                    window.open(document.getElementById('arptCsv').href, "_blank");
                                                                }
                                                            }
                                                        }
                                                    },
                                                    {
                                                        tpl: new Ext.XTemplate('<a id="arptPDF" style="display:none" href="{path}">Stock Control List</a>'), compiled: !0, data: {
                                                            path: "/Notification/BINCardData"
                                                        }
                                                    },
                                                    {
                                                        id: '', text: 'Print PDF',
                                                        listeners: {
                                                            'click': function (btn) {

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
                                id: '', title: 'STOCK USAGE REPORT', defaults: { xtype: 'panel', height: 650 }, layout: 'column',
                                items: [
                                    {
                                        id: '', columnWidth: .3, defaults: { xtype: 'form', frame: true, border: true },
                                        items: [
                                            {
                                                id: '', title: 'Filter for branch or department', defaults: { xtype: 'combo', typeAhead: true, forceSelection: true, anchor: '90%', mode: 'local' },layout: 'fit',
                                                items: [
                                                    {
                                                        id: 'cboStkRpt',
                                                        store: new Ext.data.Store({
                                                            autoLoad: true, restful: false,
                                                            url: '/Helper/getDepartmentList',
                                                            reader: new Ext.data.JsonReader({root: 'msg'}, [
                                                                { name: 'Id', type: 'int' },
                                                                { name: 'branchName', type: 'string' }
                                                            ])
                                                        }), valueField: 'Id', displayField: 'branchName'
                                                    }
                                                ]
                                            },
                                            {
                                                id: 'dtStkdf', title: 'Period From', defaults: { xtype: 'datefield', anchor: '90%', format: 'd/m/Y' }, layout: 'fit',
                                                items: [
                                                    {id: 'dtstkFr'}
                                                ]
                                            },
                                            {
                                                id: 'dtStkdt', title: 'Period To', defaults: { xtype: 'datefield', anchor: '90%', format: 'd/m/Y' }, layout: 'fit',
                                                items: [
                                                    { id: 'dtstkTo' }
                                                ],
                                                buttons: [
                                                    {
                                                        id: '', text: 'Fetch Results',
                                                        listeners: {
                                                            'click': function (btn) {
                                                                $.getJSON('/Helper/getStockUsageSummary',
                                                                    { df: Ext.fly('dtstkFr').getValue(), dt: Ext.fly('dtstkTo').getValue(), BID: Ext.getCmp('cboStkRpt').getValue() },
                                                                    function (rs) {
                                                                        if (rs.status.toString() == "true") {
                                                                            var dd = [];
                                                                            $.each(rs.msg, function (i, d) {
                                                                                dd[i] = [d.objProduct.Id, d.objProduct.product_name, d.quantity];
                                                                            });

                                                                            //console.log(dd);
                                                                            Ext.getCmp('grdStkURpt').getStore().loadData(dd);
                                                                        }
                                                                });
                                                            }
                                                        }
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        id: '', columnWidth: .7, defaults: { xtype: 'form', frame: true, border: true },
                                        items: [
                                            new Ext.grid.GridPanel({
                                                id: 'grdStkURpt', title: 'Stock Usage Report', height: 600, autoScroll: true, autoExpandColumn: 'product_name',
                                                store: new Ext.data.GroupingStore({
                                                    reader: new Ext.data.ArrayReader({}, [
                                                        { name: 'product_Id', type: 'int' },
                                                        { name: 'product_name', type: 'string' },
                                                        { name: 'quantity', type: 'int' }
                                                    ]),
                                                    sortInfo: {
                                                        field: "product_Id",
                                                        direction: "ASC"
                                                    },
                                                    groupField: "product_name"
                                                }),
                                                columns: [
                                                     { id: 'product_Id', header: 'ProductID', width: 25, hidden: true, sortable: true, dataIndex: 'product_Id' },
                                                     { id: 'product_name', header: 'Product', width: 100, hidden: false, sortable: true, dataIndex: 'product_name' },
                                                     { id: 'quantity', header: 'Total_Drawn', width: 150, hidden: false, sortable: true, dataIndex: 'quantity' }
                                                ], stripeRows: true,
                                                viewConfig: {
                                                    getRowClass: function (record, rowIndex, rowParams, store) {
                                                        return ((rowIndex % 2) == 0) ? "even-class" : "odd-class";
                                                    }
                                                }
                                            })
                                        ],
                                        buttons: [
                                            {
                                                tpl: new Ext.XTemplate('<a id="aBrStkUsagecsv" style="display:none" href="{path}">Stock Usage Report (xlsx)</a>'), compiled: !0, data: {
                                                    path: "/Notification/BranchStockUsageData"
                                                }
                                                , autoScroll: !0
                                            },
                                            {
                                                id: '', text: 'Generate CSv',
                                                listeners: {
                                                    'click': function (btn) {
                                                        if (Ext.getCmp('grdStkURpt').getStore().getCount() > 0) {
                                                            window.open(document.getElementById("aBrStkUsagecsv").href, "_blank")
                                                        }
                                                    }
                                                }
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                id: '', title: 'STORES JOURNAL', defaults: { xtype: 'panel', height: 650 }, layout: 'column',
                                items: [
                                    {
                                        id: '', columnWidth: .3, defaults: { xtype: 'form', frame: true, border: true },
                                        items: [
                                            {
                                                id: '', title: 'filter for branch or departments', defaults: { xtype: 'combo', allowBlank: false, typeAhead: true, mode: 'local', anchor:'90%' },layout: 'fit',
                                                items: [
                                                    {
                                                        id: 'jjcboBranch',
                                                        store: new Ext.data.Store({
                                                            autoLoad: true, restful: false,
                                                            url: '/Helper/getDepartmentList',
                                                            reader: new Ext.data.JsonReader({root: 'msg'}, [
                                                                { name: 'Id', type: 'int' },
                                                                { name: 'branchName', type: 'string' }
                                                            ])
                                                        }),valueField: 'Id', displayField: 'branchName'
                                                    }
                                                ]
                                            },
                                            {
                                                id: '',title: 'Period From',layout: 'fit',
                                                items: [
                                                    { id: 'jjDtF', xtype: 'datefield', format: 'd/m/Y', anchor: '90%'}
                                                ]
                                            },
                                            {
                                                id: '', title: 'Period To',layout: 'fit',
                                                items: [
                                                    { id: 'jjDtT', xtype: 'datefield', format: 'd/m/Y', anchor: '90%' }
                                                ],
                                                buttons: [
                                                    {
                                                        id: '',
                                                        text: 'Fetch Results',
                                                        listeners: {
                                                            'click': function (btn) {
                                                                getStoreJournalRecords(Ext.getCmp('grdStoreJJournal'), Ext.fly('jjDtF').getValue(), Ext.fly('jjDtT').getValue(), Ext.getCmp('jjcboBranch').getValue());
                                                            }
                                                        }
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        id: '', columnWidth: .7, title: 'Store Journal Voucher', defaults: { xtype: 'form', frame: true, border: true },
                                        items: [
                                            new Ext.grid.GridPanel({
                                                id: 'grdStoreJJournal', title: 'Store Journal', height: 600, autoScroll: true, autoExpandColumn: 'branchName',
                                                store: new Ext.data.GroupingStore({
                                                    reader: new Ext.data.ArrayReader({}, [
                                                        { name: 'Id', type: 'int' },
                                                        { name: 'sDte', type: 'string' },
                                                        { name: 'branchName', type: 'string' },
                                                        { name: 'accountNo', type: 'string' },
                                                        { name: 'accountName', type: 'string' },
                                                        { name: 'debitLeg', type: 'string' },
                                                        { name: 'creditLeg', type: 'string' },
                                                        { name: 'narration', type: 'string' },
                                                        { name: 'mnemonic', type: 'string' }
                                                    ]),
                                                    sortInfo: {
                                                        field: "Id",
                                                        direction: "ASC"
                                                    },
                                                    groupField: "Id"
                                                }),
                                                columns: [
                                                     { id: 'Id', header: 'ID', width: 25, hidden: true, sortable: true, dataIndex: 'Id' },
                                                     { id: 'sDte', header: 'DATE', width: 100, hidden: false, sortable: true, dataIndex: 'sDte' },
                                                     { id: 'branchName', header: 'BRANCHNAME', width: 150, hidden: false, sortable: true, dataIndex: 'branchName' },
                                                     { id: 'accountNo', header: 'ACCOUNTNUMBER', width: 150, hidden: false, sortable: true, dataIndex: 'accountNo' },
                                                     { id: 'accountName', header: 'ACCOUNTNAME', width: 200, hidden: false, sortable: true, dataIndex: 'accountName' },
                                                     { id: 'debitLeg', header: 'DEBIT(GHc)', width: 100, hidden: false, sortable: true, dataIndex: 'debitLeg' },
                                                     { id: 'creditLeg', header: 'CREDIT(GHc)', width: 100, hidden: false, sortable: true, dataIndex: 'creditLeg' },
                                                     { id: 'narration', header: 'NARRATION', width: 200, hidden: false, sortable: true, dataIndex: 'narration' },
                                                     { id: 'mnemonic', header: 'BRANCH', width: 100, hidden: false, sortable: true, dataIndex: 'mnemonic' },
                                                ], stripeRows: true,
                                                viewConfig: {
                                                    getRowClass: function (record, rowIndex, rowParams, store) {
                                                        return ((rowIndex % 2) == 0) ? "even-class" : "odd-class";
                                                    }
                                                }
                                            })
                                        ],
                                        buttons: [
                                            {
                                                tpl: new Ext.XTemplate('<a id="aSTRJcsv" style="display:none" href="{path}">StoreJournal Report (xlsx)</a>'), compiled: !0, data: {
                                                    path: "/Notification/StoreJournalRecords"
                                                }
                                                , autoScroll: !0
                                            },
                                            {
                                                id: '', text: 'Print Csv',
                                                listeners: {
                                                    'click': function (btn) {
                                                        if (Ext.getCmp('grdStoreJJournal').getStore().getCount() > 0) {
                                                            window.open(document.getElementById("aSTRJcsv").href, "_blank")
                                                        }
                                                    }
                                                }
                                            },
                                            {
                                                tpl: new Ext.XTemplate('<a id="aSTRJpdf" style="display:none" href="{path}">StoreJournal Report (PDF)</a>'), compiled: !0, data: {
                                                    path: "/Notification/PrintStoreJournal"
                                                }
                                                , autoScroll: !0
                                            }
                                            ,
                                            {
                                                id: '', text: 'Print PDF',
                                                listeners: {
                                                    'click': function (btn) {
                                                        if (Ext.getCmp('grdStoreJJournal').getStore().getCount() > 0) {
                                                            window.open(document.getElementById("aSTRJpdf").href, "_blank")
                                                        }
                                                    }
                                                }
                                            }
                                            
                                        ]
                                    }
                                ]
                            },
                            {
                                title: 'PRODUCT REPORT', defaults: { xtype: 'panel', height: 650 }, layout: 'column',
                                items: [
                                    {
                                        columnWidth: .3, defaults: { xtype: 'form', frame: true, border: true },
                                        items: [
                                            {
                                                id: 'frmPrFrom', title: 'Period From', defaults: { xtype: 'datefield', format: 'd/m/Y', anchor: '90%',allowBlank: false }, layout: 'fit',
                                                items: [
                                                    { id: 'xfr' }
                                                ]
                                            },
                                            {
                                                id: 'frmPrTo', title: 'Period To', defaults: { xtype: 'datefield', format: 'd/m/Y', anchor: '90%', allowBlank: false }, layout: 'fit',
                                                items: [
                                                    { id: 'xto' }
                                                ],
                                                buttons: [
                                                    {
                                                        id: '', text: 'Fetch Results',
                                                        listeners: {
                                                            'click': function (btn) {
                                                                var pf = Ext.getCmp('frmPrFrom').getForm();
                                                                var pt = Ext.getCmp('frmPrTo').getForm();

                                                                if (pf.isValid() && pt.isValid()) {
                                                                    $.getJSON('/Helper/getProductList',
                                                                        { df: Ext.fly('xfr').getValue(), dt: Ext.fly('xto').getValue() }, function (r) {
                                                                        if (r.status.toString() == "true") {
                                                                            var res = [];
                                                                            $.each(r.msg, function (i, d) {
                                                                                res[i] = [d.productId, d.productName, d.totalDisbursed, numberWithCommas(d.totalAmount)];
                                                                            });

                                                                            Ext.getCmp('grdProdSummary').getStore().loadData(res);
                                                                        }
                                                                    });
                                                                }
                                                            }
                                                        }
                                                    }
                                                ]
                                            },
                                            {
                                                id: '',
                                                items: [
                                                    new Ext.grid.GridPanel({
                                                        id: 'grdProdSummary', title: 'Product Summary', height: 450, autoScroll: true, autoExpandColumn: 'productName',
                                                        store: new Ext.data.GroupingStore({
                                                            reader: new Ext.data.ArrayReader({}, [
                                                                { name: 'productId', type: 'int' },
                                                                { name: 'productName', type: 'string' },
                                                                { name: 'totalDisbursed', type: 'string' },
                                                                { name: 'totalAmount', type: 'string' }
                                                            ]),
                                                            sortInfo: {
                                                                field: "productName",
                                                                direction: "ASC"
                                                            },
                                                            groupField: "productId"
                                                        }),
                                                        columns: [
                                                             { id: 'productId', header: 'ID', width: 25, hidden: true, sortable: true, dataIndex: 'productId' },
                                                             { id: 'productName', header: 'PRODUCT', width: 200, hidden: false, sortable: true, dataIndex: 'productName' },
                                                             { id: 'totalDisbursed', header: 'DISBURSED', width: 100, hidden: false, sortable: true, dataIndex: 'totalDisbursed' },
                                                             { id: 'totalAmount', header: 'AMOUNT', width: 100, hidden: false, sortable: true, dataIndex: 'totalAmount' }
                                                        ], stripeRows: true,
                                                        viewConfig: {
                                                            getRowClass: function (record, rowIndex, rowParams, store) {
                                                                return ((rowIndex % 2) == 0) ? "even-class" : "odd-class";
                                                            }
                                                        },
                                                        listeners: {
                                                            'rowdblclick': function (e, t) {
                                                                var rec = e.getStore().getAt(t);
                                                                $.getJSON('/Helper/getBranchReport',
                                                                    { df: Ext.fly('xfr').getValue(), dt: Ext.fly('xto').getValue(), PID: rec.get('productId') },
                                                                    function (r) {
                                                                        if (r.status.toString() == "true") {
                                                                            var b = [];
                                                                            $.each(r.msg, function (i, d) {
                                                                                b[i] = [d.Id, d.branchName, d.branchQty, d.branchPrice];
                                                                            });

                                                                            console.log(b);
                                                                            Ext.getCmp('grdBranchProdSummary').getStore().loadData(b);
                                                                        }
                                                                    });
                                                            }
                                                        }
                                                    })
                                                ],
                                                buttons: [
                                                    {
                                                        tpl: new Ext.XTemplate('<a id="aProdcsv" style="display:none" href="{path}">Products (xlsx)</a>'), compiled: !0, data: {
                                                            path: "/Notification/MonthlyDisbursedReport"
                                                        }
                                                        , autoScroll: !0
                                                    },
                                                    {
                                                        id: '', text: 'Download',
                                                        listeners: {
                                                            'click': function (btn) {
                                                                if (Ext.getCmp('grdProdSummary').getStore().getCount() > 0) {
                                                                    window.open(document.getElementById("aProdcsv").href, "_blank")
                                                                }
                                                            }
                                                        }
                                                    },
                                                    {
                                                        tpl: new Ext.XTemplate('<a id="aProdPDF" style="display:none" href="{path}">Products (PDF)</a>'), compiled: !0, data: {
                                                            path: "/Notification/DisbursedMonthlyReport"
                                                        }
                                                        , autoScroll: !0
                                                    },
                                                    {
                                                        id: '', text: 'Print',
                                                        listeners: {
                                                            'click': function (btn) {
                                                                if (Ext.getCmp('grdProdSummary').getStore().getCount() > 0) {
                                                                    window.open(document.getElementById("aProdPDF").href, "_blank")
                                                                }
                                                            }
                                                        }
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        title: 'Product Panel 2', columnWidth: .7, defaults: { xtype: 'form', frame: 'true', broder: 'true' }, layout: 'form',
                                        items: [
                                            {
                                                id: '',
                                                //title: 'form 1',
                                                items: [
                                                    new Ext.grid.GridPanel({
                                                        id: 'grdBranchProdSummary', title: 'Product Summary', height: 450, autoScroll: true, autoExpandColumn: 'branchName',
                                                        store: new Ext.data.GroupingStore({
                                                            reader: new Ext.data.ArrayReader({}, [
                                                                { name: 'Id', type: 'int'},
                                                                { name: 'branchName', type: 'string' },
                                                                { name: 'branchQty', type: 'string' },
                                                                { name: 'branchPrice', type: 'string' }
                                                            ]),
                                                            sortInfo: {
                                                                field: "branchName",
                                                                direction: "ASC"
                                                            },
                                                            groupField: "branchName"
                                                        }),
                                                        columns: [
                                                             { id: 'Id', header: 'ID', width: 25, hidden: true, sortable: true, dataIndex: 'Id' },
                                                             { id: 'branchName', header: 'BRANCH', width: 25, hidden: false, sortable: true, dataIndex: 'branchName' },
                                                             { id: 'branchQty', header: 'QUANTITY', width: 200, hidden: false, sortable: true, dataIndex: 'branchQty' },
                                                             { id: 'branchPrice', header: 'PRICE', width: 100, hidden: false, sortable: true, dataIndex: 'branchPrice' }
                                                        ], stripeRows: true,
                                                        viewConfig: {
                                                            getRowClass: function (record, rowIndex, rowParams, store) {
                                                                return ((rowIndex % 2) == 0) ? "even-class" : "odd-class";
                                                            }
                                                        }
                                                    })
                                                ],
                                                buttons: [
                                                    {
                                                        tpl: new Ext.XTemplate('<a id="aBrProdcsv" style="display:none" href="{path}">Products (xlsx)</a>'), compiled: !0, data: {
                                                            path: "/Notification/BranchMonthlyDisbursedReport"
                                                        }
                                                        , autoScroll: !0
                                                    },
                                                    {
                                                        id: '', text: 'Generate Csv',
                                                        listeners: {
                                                            'click': function (btn) {
                                                                if (Ext.getCmp('grdBranchProdSummary').getStore().getCount() > 0) {
                                                                    window.open(document.getElementById("aBrProdcsv").href, "_blank")
                                                                }
                                                            }
                                                        }
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }).show();
        }
    });

});