Ext.onReady(function () {
    
    var requestDta = [];

    var getActiveLPOs = function (ktrl) {
        ktrl.getStore().removeAll();
        $.getJSON('/Helper/getActiveProcurements', {pstatusId: 2}, function (rsp) {
            var p = [];
            if (rsp.status.toString() == "true") {
                $.each(rsp.msg, function (i, d) {
                    console.log(d.Proc_Id.Id.toString());
                    //if (d.Proc_Id.Id.toString() == "0") {
                        p[i] = [d.Id,d.ProcurementCode, d.ProcurementName];
                    //}
                });

                console.log(p);
                ktrl.getStore().loadData(p);
            }
        }, "json");
    }

    var getCurrentStockLevel = function (ktrl) {
        $.getJSON('/Helper/getProductStockList', {}, function (r) {
            var a = [];
            if (r.status.toString() == "true") {
                $.each(r.msg, function (i,d) {
                    a[i] = [d.Id, d.product_Id.product_name, d.parentCategory_code.productCode,d.CurrentStockLevel];
                });
                //console.log(a);
                ktrl.getStore().loadData(a);
            }
        });
    }

    var getOrderNumbers = function (statID, k) {
        $.getJSON('/Helper/getOrderRecords', { stat: statID }, function (dta) {
            var x = []; var rt = '';
            if (dta.status.toString() == "true") {
                $.each(dta.msg, function (i, d) {
                    x[i] = [d.Id, d.orderNumber, d.orderstatus_Id.statusDescription, d.usrId.username, d.bName];
                });


                k.getStore().loadData(x);
            }
        });
    }

    var bt = Ext.get('warehse');

    bt.on('click', function () {

        var w = Ext.getCmp('winOrderProcessing');
        if (!w) {
            w = new Ext.Window({
                id: 'winOrderProcessing',
                title: 'ORDER PROCESSING CENTER',
                height: 800,
                width: 1300,
                closable: true,
                defaults: { xtype: 'tabpanel', tabPosition: 'bottom', enableScroll: true, frame: true, border: true },
                items: [
                    {
                        activeTab: 0,
                        items: [
                            {
                                id: '', title: 'RECEIVE DELIVERED LPOs', defaults: { xtype: 'panel', frame: true, border: true }, layout: 'column',
                                items: [
                                    {
                                        id: '', tttle: 'Pending LPOs', width: '30%', height: 700, defaults: { xtype: 'form', frame: true, border: true },
                                        items: [
                                            {
                                                id: '',
                                                items: [
                                                    new Ext.grid.GridPanel({
                                                        id: 'grdProcList', title: 'Delivered LPOs:double-click to select', height: 650, autoScroll: true,
                                                        store: new Ext.data.GroupingStore({
                                                            reader: new Ext.data.ArrayReader({}, [
                                                                { name: 'Id', type: 'int' },
                                                                { name: 'ProcurementCode', type: 'string' },
                                                                { name: 'ProcurementName', type: 'string' }
                                                            ]),
                                                            sortInfo: {
                                                                field: "Id",
                                                                direction: "ASC"
                                                            },
                                                            groupField: "Id"
                                                        }),
                                                        columns: [
                                                            { id: 'Id', header: 'ID', width: 25, hidden: true, sortable: true, dataIndex: 'Id' },
                                                             { id: 'ProcurementCode', header: 'CODE', width: 200, hidden: false, sortable: true, dataIndex: 'ProcurementCode' },
                                                             { id: 'ProcurementName', header: 'QTY', width: 160, hidden: false, sortable: true, dataIndex: 'ProcurementName' }
                                                        ], stripeRows: true,
                                                        viewConfig: {
                                                            getRowClass: function (record, rowIndex, rowParams, store) {
                                                                return ((rowIndex % 2) == 0) ? "even-class" : "odd-class";
                                                            }
                                                        },
                                                        listeners: {
                                                            'afterrender': function () {
                                                                setInterval(function () {
                                                                    getActiveLPOs(Ext.getCmp('grdProcList'));
                                                                }, 60000);
                                                            },
                                                            'render': function () {
                                                                //setInterval(function () {
                                                                getActiveLPOs(Ext.getCmp('grdProcList'));
                                                                //}, 60000);
                                                            },
                                                            'rowdblclick': function (e, t) {
                                                                Ext.getCmp('grdProcDetails').getStore().removeAll();
                                                                Ext.getCmp('frmRecon').getForm().reset();

                                                                var rec = e.getStore().getAt(t);

                                                                $('#lpcode').val(rec.get('ProcurementCode'));
                                                                $('#lpdes').val(rec.get('ProcurementName'));
                                                                $.getJSON('/Product/getLPOItems', { id: rec.get('Id'), procCode: rec.get('ProcurementCode') }, function (d) {
                                                                    var po = [];
                                                                    if (d.status.toString() == "true") {
                                                                        $.each(d.msg, function (i, dd) {
                                                                            po[i] = [dd.Id, dd.product_name, dd.categoryLookup_code.categoryLookup, dd.qty_sup, dd.dte, dd.negotiated_unit_price, dd.supplier_Id.sup_name];
                                                                        });
                                                                        Ext.getCmp('grdProcDetails').getStore().loadData(po);
                                                                        $('#lpcode').attr('readonly', true);
                                                                        $('#lpdes').attr('readonly', true);
                                                                    }
                                                                });
                                                            }
                                                        }
                                                    })
                                                ],
                                                buttons: [
                                                    {
                                                        text: 'Refresh', hidden: true,
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        id: '', title: 'Local Processing Order Items', defaults: { xtype: 'form', frame: true, border: true }, width: '70%', layout: 'form',
                                        items: [
                                            {
                                                id: 'frmStkDetails', title: 'LPO Stock Details', defaults: { xtype: 'textfield', allowBlank: false, anchor: '90%' }, height: 100,
                                                items: [
                                                    { id: 'lpcode', fieldLabel: 'Code' },
                                                    { id: 'lpdes', fieldLabel: 'Description' }
                                                ]
                                            },
                                            {
                                                title: '',
                                                items: [
                                                    new Ext.grid.GridPanel({
                                                        id: 'grdProcDetails', title: 'Active LPOs details', height: 300, autoScroll: true,
                                                        store: new Ext.data.GroupingStore({
                                                            reader: new Ext.data.ArrayReader({}, [
                                                                { name: 'Id', type: 'int' },
                                                                { name: 'product_name', type: 'string' },
                                                                { name: 'categoryLookup', type: 'string' },
                                                                { name: 'qty_sup', type: 'string' },
                                                                { name: 'dte', type: 'string' },
                                                                { name: 'negotiated_unit_price', type: 'int' },
                                                                { name: 'sup_name', type: 'string' }
                                                            ]),
                                                            sortInfo: {
                                                                field: "Id",
                                                                direction: "ASC"
                                                            },
                                                            groupField: "Id"
                                                        }),
                                                        columns: [
                                                             { id: 'Id', header: 'ID', width: 25, hidden: true, sortable: true, dataIndex: 'Id' },
                                                             { id: 'product_name', header: 'NARRATION', width: 200, hidden: false, sortable: true, dataIndex: 'product_name' },
                                                             { id: 'categoryLookup', header: 'CATEGORY', width: 160, hidden: false, sortable: true, dataIndex: 'categoryLookup' },
                                                             { id: 'qty_sup', header: 'QTY', width: 160, hidden: false, sortable: true, dataIndex: 'qty_sup' },
                                                             { id: 'dte', header: 'DATE', width: 160, hidden: false, sortable: true, dataIndex: 'dte' },
                                                             { id: 'negotiated_unit_price', header: 'UNIT.PRICE', width: 160, hidden: false, sortable: true, dataIndex: 'negotiated_unit_price' },
                                                             { id: 'sup_name', header: 'SUPPLIER', width: 160, hidden: false, sortable: true, dataIndex: 'sup_name' }
                                                        ], stripeRows: true,
                                                        viewConfig: {
                                                            getRowClass: function (record, rowIndex, rowParams, store) {
                                                                return ((rowIndex % 2) == 0) ? "even-class" : "odd-class";
                                                            }
                                                        },
                                                        listeners: {
                                                            'afterrender': function () {

                                                            }
                                                        }
                                                    })
                                                ],
                                                buttons: [
                                                    {
                                                        text: 'Execute LPOs', id: 'y', hidden: false,
                                                        listeners: {
                                                            'click': function (btn) {
                                                                $.post('/Product/executeLocalPurchaseOrder', { LPO: Ext.fly('lpcode').getValue() }, function (rsp) {
                                                                    if (rsp.status.toString() == "true") {
                                                                        $('#txtrecon').val(rsp.msg.toString());
                                                                        $('#x').trigger('click');

                                                                        Ext.getCmp('grdProcDetails').getStore().removeAll();
                                                                        Ext.getCmp('frmStkDetails').getForm().reset();
                                                                        getActiveLPOs(Ext.getCmp('grdProcList'));
                                                                    }
                                                                }, "json");
                                                            }
                                                        }
                                                    },
                                                    {
                                                        id: 'x', text: 'testing', hidden: true,
                                                        listeners: {
                                                            'click': function (btn) {
                                                                $.post('/Product/updateProcurementStatus', { LPO: Ext.fly('lpcode').getValue() }, function (r) {
                                                                    if (r.status.toString() == "true") {
                                                                        Ext.Msg.alert('EXECUTE LPO', r.msg.toString(), this);
                                                                    }
                                                                }, "json");
                                                            }
                                                        }
                                                    }
                                                ]
                                            },
                                            {
                                                id: 'frmRecon', title: 'stock reconciliation results', height: 200, defaults: { xtype: 'textarea', grow: false }, layout: 'fit',
                                                items: [
                                                    {
                                                        id: 'txtrecon',
                                                        style: {
                                                            'color': 'blue',
                                                            'font-size': '18px'
                                                        }
                                                    }
                                                ],
                                                buttons: [
                                                    {
                                                        text: 'Clear',
                                                        listeners: {
                                                            'click': function (btn) {
                                                                Ext.getCmp('frmRecon').getForm().reset();
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
                                id: '', title: 'DEPARTMENT/BRANCH REQUESTS', style: {}, defaults: { xtype: 'panel', frame: true, border: true }, layout: 'column',
                                items: [
                                    {
                                        width: '30%', title: 'Branch Order Requests', height: 700, defaults: { xtype: 'form', frame: true, border: true },
                                        items: [
                                            {
                                                id: '', height: 50, defaults: { allowBlank: false, anchor: '100%' }, layout: 'fit',
                                                items: [
                                                    {
                                                        xtype: 'combo', id: 'bOrdStat', forceSelection: true, typeAhead: true, mode: 'local', blankText: 'select Procurement status',
                                                        store: new Ext.data.Store({
                                                            id: '', autoLoad: true, restful: false,
                                                            url: '/Helper/getOrderStatus',
                                                            reader: new Ext.data.JsonReader({ type: 'json', root: 'msg' }, [
                                                                { name: 'Id', type: 'int' },
                                                                { name: 'statusDescription', type: 'string' }
                                                            ])
                                                        }), valueField: 'Id', displayField: 'statusDescription',
                                                        listeners: {
                                                            'select': function () {
                                                                $('#torderDet').attr('readonly', true);
                                                                getOrderNumbers(Ext.getCmp('bOrdStat').getValue(), Ext.getCmp('grdOrders'));
                                                            }
                                                        }
                                                    }
                                                ]
                                            },
                                            {
                                                id: '', title: 'Select Branch', defaults: { xtype: 'combo', typeAhead: true, forceSelection: true, allowBlank: false, anchor: '90%', mode: 'local' },layout: 'fit',
                                                items: [
                                                    {
                                                        id: 'bOrdStatBranch', blankText: 'select branch',
                                                        store: new Ext.data.Store({
                                                            autoLoad: true, restful: false,
                                                            url: '/Helper/getDepartmentList',
                                                            reader: new Ext.data.JsonReader({root:'msg'}, [
                                                                { name: 'Id', type: 'int' },
                                                                { name: 'branchName', type: 'string' }
                                                            ])
                                                        }), valueField: 'Id', displayField: 'branchName',
                                                        listeners: {
                                                            'select': function () {
                                                                if (Ext.getCmp('bOrdStat').getValue() > 0) {
                                                                    //status is not empty...look for orders matching the selected department or unit
                                                                    Ext.getCmp('grdOrders').getStore().removeAll();

                                                                    $.getJSON('/Helper/getOrderRecordsForBusinessUnit', 
                                                                        { BID: Ext.getCmp('bOrdStatBranch').getValue(), stat: Ext.getCmp('bOrdStat').getValue() }, function (r) {
                                                                        if (r.status.toString() == "true") {
                                                                            var rs = [];
                                                                            $.each(r.msg, function (i, d) {
                                                                                rs[i] = [d.Id, d.orderNumber, d.orderstatus_Id.statusDescription, d.usrId.username, d.bName]
                                                                            });
                                                                            Ext.getCmp('grdOrders').getStore().loadData(rs);
                                                                        }
                                                                    });
                                                                }
                                                            }
                                                        }
                                                    }
                                                ]
                                            },
                                            new Ext.grid.GridPanel({
                                                id: 'grdOrders', title: 'Active Orders', height: 500, autoScroll: true,autoExpandColumn: 'orderNumber',
                                                store: new Ext.data.GroupingStore({
                                                    reader: new Ext.data.ArrayReader({}, [
                                                        { name: 'Id', type: 'int' },
                                                        { name: 'orderNumber', type: 'string' },
                                                        { name: 'statusDescription', type: 'string' },
                                                        { name: 'username', type: 'string' },
                                                        { name: 'bName', type: 'string' }
                                                    ]),
                                                    sortInfo: {
                                                        field: "orderNumber",
                                                        direction: "ASC"
                                                    },
                                                    groupField: "orderNumber"
                                                }),
                                                columns: [
                                                     { id: 'Id', header: 'ID', width: 25, hidden: true, sortable: true, dataIndex: 'Id' },
                                                     { id: 'orderNumber', header: 'ORDERNo', width: 350, hidden: false, sortable: true, dataIndex: 'orderNumber' },
                                                     { id: 'statusDescription', header: 'DESCRIPTION', width: 160, hidden: true, sortable: true, dataIndex: 'statusDescription' },
                                                     { id: 'username', header: 'USER', width: 160, hidden: true, sortable: true, dataIndex: 'username' },
                                                     { id: 'bName', header: 'BRANCH', width: 160, hidden: true, sortable: true, dataIndex: 'bName' }

                                                ], stripeRows: true,
                                                viewConfig: {
                                                    getRowClass: function (record, rowIndex, rowParams, store) {
                                                        return ((rowIndex % 2) == 0) ? "even-class" : "odd-class";
                                                    }
                                                },
                                                listeners: {
                                                    'rowdblclick': function (e, t) {
                                                        var rec = e.getStore().getAt(t);
                                                        $('#rcode').val(rec.get('orderNumber')).attr('readonly', true);
                                                        $('#rbranch').val(rec.get('bName')).attr('readonly', true);
                                                        $('#rinputter').val(rec.get('username')).attr('readonly', true);

                                                        $.getJSON('/Helper/getSelectedOrderList', { id: parseInt(rec.get('Id')), orderCode: rec.get('orderNumber') }, function (rs) {
                                                            $('#torderDet').val(rs.msg.toString());
                                                            $('#dsbNo').val(rs.disbValue.toString()).attr('readonly', true);
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
                                                        $('#bOrdStatBranch').val('');
                                                        getOrderNumbers(Ext.getCmp('bOrdStat').getValue(), Ext.getCmp('grdOrders'));
                                                    }
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        width: '70%', title: '', defaults: { xtype: 'panel', height: 665 }, layout: 'column',
                                        items: [
                                            {
                                                title: 'Branch Request', width: '50%', defaults: { xtype: 'form', frame: true, border: true },
                                                items: [
                                                    {
                                                        id: 'frmRq', defaults: { xtype: 'textfield', anchor: '90%' },
                                                        items: [
                                                            { id: 'rcode', fieldLabel: 'Request Code' },
                                                            { id: 'rbranch', fieldLabel: 'Branch' },
                                                            { id: 'rinputter', fieldLabel: 'Inputter' }
                                                        ]
                                                    },
                                                    {
                                                        id: 'frmDt', title: 'Details', layout: 'fit', height: 550,
                                                        items: [
                                                            {
                                                                id: 'torderDet', xtype: 'textarea', autoScroll: true,
                                                                style: {
                                                                    'font-size': '13px',
                                                                    'background-color': 'yellow'
                                                                }
                                                            }
                                                        ],
                                                        buttons: [
                                                            {
                                                                id: 'tbtnHide', hidden: true,
                                                                listener: {
                                                                    'click': function (btn) {
                                                                        $('#torderDet').attr('readonly', true);
                                                                    }
                                                                }
                                                            }
                                                        ]
                                                    }
                                                ]
                                            },
                                            {
                                                title: 'Order Processing', width: '50%', defaults: { xtype: 'form', border: true, frame: true }, layout: 'accordion',
                                                items: [
                                                    {
                                                        id: 'frmProcess', title: 'Order Processing Form', defaults: { xtype: 'combo', allowBlank: false, forceSelection: true, typeAhead: true, mode: 'local', anchor: '95%' }, layout: 'form',
                                                        items: [
                                                            { xtype: 'textfield', id: 'dsbNo', fieldLabel: 'Disb. No' },
                                                            {
                                                                id: 'xprd', fieldLabel: 'Product',
                                                                store: new Ext.data.Store({
                                                                    autoLoad: true, restful: false,
                                                                    url: '/Helper/getProducts',
                                                                    reader: new Ext.data.JsonReader({ type: 'json', root: 'msg' }, [
                                                                        { name: 'Id', type: 'int' },
                                                                        { name: 'product_name', type: 'string' }
                                                                    ])
                                                                }), valueField: 'Id', displayField: 'product_name',
                                                                listeners: {
                                                                    'select': function () {
                                                                        $('#xLPO').val('');
                                                                        $('#xprice').val('');
                                                                        $('#xqty').val('');

                                                                        $.getJSON('/Helper/getProductPriceAndStockLeft', { pid: Ext.getCmp('xprd').getValue() }, function (x) {
                                                                            if (x.status.toString() == "true") {
                                                                                $('#xprice').val(x.msg.negotiated_unit_price.toString()).attr('readonly', true);
                                                                                $('#xqty').val(x.stock.CurrentStockLevel.toString()).attr('readonly', true);
                                                                                $('#xAWP').val(x.wap.AWP.toString()).attr('readonly', true);
                                                                            }
                                                                        });

                                                                        $('#dsbNo').attr('readonly', true);
                                                                        $('#xqtygv').val('').focus();
                                                                    }
                                                                }
                                                            },
                                                            { xtype: 'numberfield', id: 'xprice', fieldLabel: 'Price' },
                                                            { xtype: 'numberfield', id: 'xAWP', fieldLabel: 'AWP' },
                                                            { xtype: 'numberfield', id: 'xqty', fieldLabel: 'Qty Left' },
                                                            { xtype: 'numberfield', id: 'xqtygv', fieldLabel: 'Qty given' },
                                                            {
                                                                id: 'xLPO', fieldLabel: 'LPO', allowBlank: true, hidden: true,
                                                                store: new Ext.data.Store({
                                                                    autoLoad: true, restful: false,
                                                                    url: '/Helper/getActiveProcurements?pstatusId=0',
                                                                    reader: new Ext.data.JsonReader({ type: 'json', root: 'msg' }, [
                                                                        { name: 'Id', type: 'int' },
                                                                        { name: 'ProcurementCode', type: 'string' }
                                                                    ])
                                                                }), valueField: 'Id', displayField: 'ProcurementCode'
                                                            },
                                                            {
                                                                xtype: 'button', id: 'xbtnAdd', text: 'Add',
                                                                listeners: {
                                                                    'click': function () {
                                                                        var f = Ext.getCmp('frmProcess').getForm();
                                                                        if ($('#dsbNo').val().length > 0 && $('#xprd').val().length > 0 && $('#xprice').val().length > 0 && $('#xqty').val().length > 0 && $('#xqtygv').val().length > 0) {
                                                                            $.post('/Product/addDisbursementItems',
                                                                                {
                                                                                    dNo: Ext.fly('dsbNo').getValue(), pId: Ext.getCmp('xprd').getValue(), prc: Ext.fly('xprice').getValue(),
                                                                                    qnt: Ext.fly('xqty').getValue(), qnty: Ext.fly('xqtygv').getValue(), ordNo: Ext.fly('rcode').getValue(),
                                                                                    bId: Ext.fly('rbranch').getValue()
                                                                                },
                                                                                function (fs) {
                                                                                    if (fs.status.toString() == "true") {
                                                                                        $('#xtotamt').val(fs.totAmt.toString());
                                                                                        $.each(fs.msg, function (i, d) {
                                                                                            requestDta[i] = [d.Id, d.product_Id.product_name, d.qty, d.price];
                                                                                        });

                                                                                        Ext.getCmp('grdProd').getStore().loadData(requestDta);
                                                                                    }

                                                                                    if (fs.status.toString() == "error") {
                                                                                        Ext.Msg.alert('ORDER PROCESSING CENTER', fs.msg.toString(), this);
                                                                                    }

                                                                                    $('#xbtnClrInput').trigger('click');
                                                                                }, "json");
                                                                        }
                                                                    }
                                                                }
                                                            },
                                                            {
                                                                xtype: 'button', id: 'xbtnClrInput', text: 'clear', hidden: true,
                                                                listeners: {
                                                                    'click': function (btn) {
                                                                        $.getJSON('/Product/clearDisbursementItems', {}, function (r) {
                                                                            console.log(r.status.toString());
                                                                        });
                                                                        $('#xLPO').val('');
                                                                        $('#xprice').val('');
                                                                        $('#xqty').val('');
                                                                        $('#xqtygv').val('');
                                                                        $('#xAWP').val('');
                                                                        $('#dsbNo').attr('readonly', false);
                                                                        $('#bOrdStatBranch').val('');
                                                                        //Ext.getCmp('grdProd').getStore().removeAll();
                                                                        $('#xprd').val('').focus();
                                                                    }
                                                                }
                                                            },
                                                            new Ext.grid.GridPanel({
                                                                id: 'grdProd', title: '', height: 250, autoScroll: true,
                                                                store: new Ext.data.GroupingStore({
                                                                    reader: new Ext.data.ArrayReader({}, [
                                                                        { name: 'Id', type: 'int' },
                                                                        { name: 'product_name', type: 'string' },
                                                                        { name: 'qty', type: 'string' },
                                                                        { name: 'price', type: 'string' }
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
                                                                     { id: 'qty', header: 'QTY', width: 100, hidden: false, sortable: true, dataIndex: 'qty' },
                                                                     { id: 'price', header: 'PRICE', width: 100, hidden: false, sortable: true, dataIndex: 'price' }
                                                                ], stripeRows: true,
                                                                viewConfig: {
                                                                    getRowClass: function (record, rowIndex, rowParams, store) {
                                                                        return ((rowIndex % 2) == 0) ? "even-class" : "odd-class";
                                                                    }
                                                                }
                                                            }),
                                                            {
                                                                xtype: 'numberfield', id: 'xtotamt', fieldLabel: 'Total Amount', style: { 'font-size': '16px', 'color': 'red' }, allowBlank: true,
                                                                style: {
                                                                    'font-size': '16px',
                                                                    'font-color': 'red',
                                                                    'text-align': 'center'
                                                                }
                                                            }
                                                        ],
                                                        buttons: [
                                                            {
                                                                id: 'xBtnSv', text: 'Save',
                                                                listeners: {
                                                                    'click': function (btn) {

                                                                        var r = new Ext.LoadMask(Ext.getCmp("winOrderProcessing").el, {
                                                                            msg: "Saving Order Request to Database.Please wait..."
                                                                        });
                                                                        r.show();

                                                                        $.ajax({
                                                                            dataType: 'json',
                                                                            url: '/Product/saveDisbursementItems',
                                                                            contentType: 'application/json;charset=utf-8',
                                                                            traditional: true,
                                                                            data: {
                                                                                orderNo: Ext.fly('rcode').getValue(),
                                                                                items: requestDta
                                                                            },
                                                                            success: function (data, status, xhttp) {
                                                                                r.hide();
                                                                                if (data.status.toString() == "true") {
                                                                                    Ext.Msg.alert('ORDER PROCESSING CENTER', data.msg.toString(), this);
                                                                                }
                                                                                $('#xBtnClr').trigger('click');
                                                                            },
                                                                            error: function (data, status, xhttp) {
                                                                                Ext.Msg.alert('ORDER PROCESSING CENTER', data.msg.toString(), this);
                                                                            }
                                                                        });
                                                                    }
                                                                }
                                                            },
                                                            {
                                                                id: 'xBtnClr', text: 'Clear',
                                                                listeners: {
                                                                    'click': function () {
                                                                        Ext.getCmp('frmProcess').getForm().reset();
                                                                        Ext.getCmp('frmRq').getForm().reset();
                                                                        Ext.getCmp('frmDt').getForm().reset();
                                                                        Ext.getCmp('grdOrders').getStore().removeAll();
                                                                        Ext.getCmp('grdProd').getStore().removeAll();
                                                                        $('#bOrdStat').val('').trigger('click');
                                                                        $('#dsbNo').val('').attr('readonly', false);

                                                                        $.post('/Product/clearDisbursementItems', {}, function (r) {
                                                                            console.log(r.status.toString());
                                                                        }, "json");
                                                                    }
                                                                }
                                                            },
                                                            {
                                                                id: 'xBtnRject', text: 'Reject',
                                                                listeners: {
                                                                    'click': function (btn) {
                                                                        $.post('/Product/rejectRequest',
                                                                            {
                                                                            orderNo: Ext.fly('rcode').getValue(),
                                                                            statusId: 5, inputter: Ext.fly('rinputter').getValue()
                                                                        }, function (r) {
                                                                            if (r.status.toString() == "true") {
                                                                                Ext.Msg.alert('REQUEST STATUS', 'Request for stocks have been rejected', this);
                                                                                $('#xBtnClr').trigger('click');
                                                                            }
                                                                        }, "json");
                                                                    }
                                                                }
                                                            },
                                                            {
                                                                tpl: new Ext.XTemplate('<a id="aLVoucher" style="display:none" href="{path}">Stock Issue Voucher(PDF)</a>'), compiled: !0, data: {
                                                                    path: "/Notification/test"
                                                                }
                                                            },
                                                            {
                                                                id: 'xBtnRp', text: 'Report', hidden: true,
                                                                listeners: {
                                                                    'click': function (btn) {
                                                                        window.open(document.getElementById('aLVoucher').href, "_blank");
                                                                    }
                                                                }
                                                            }
                                                        ]
                                                    },
                                                    {
                                                        id: 'frmAvailableStock', title: 'Current Product Stock',
                                                        items: [
                                                            new Ext.grid.GridPanel({
                                                                id: 'grdCurrentProdStock', title: '', height: 500, autoScroll: true,
                                                                store: new Ext.data.GroupingStore({
                                                                    reader: new Ext.data.ArrayReader({}, [
                                                                        { name: 'Id', type: 'int' },
                                                                        { name: 'product_name', type: 'string' },
                                                                        { name: 'productCode', type: 'string' },
                                                                        { name: 'CurrentStockLevel', type: 'string' }
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
                                                                     { id: 'productCode', header: 'CATEGORY', width: 160, hidden: false, sortable: true, dataIndex: 'productCode' },
                                                                     { id: 'CurrentStockLevel', header: 'STOCK', width: 160, hidden: false, sortable: true, dataIndex: 'CurrentStockLevel' }
                                                                ], stripeRows: true,
                                                                viewConfig: {
                                                                    getRowClass: function (record, rowIndex, rowParams, store) {
                                                                        return ((rowIndex % 2) == 0) ? "even-class" : "odd-class";
                                                                    }
                                                                },
                                                                listeners: {
                                                                    'render': function () {
                                                                        getCurrentStockLevel(Ext.getCmp('grdCurrentProdStock'));
                                                                    },
                                                                    'afterrender': function () {
                                                                        setInterval(function () {
                                                                            getCurrentStockLevel(Ext.getCmp('grdCurrentProdStock'));
                                                                        }, 25000);  //fire every 25 seconds
                                                                    }
                                                                }
                                                            })
                                                        ],
                                                        buttons: [
                                                            {
                                                                tpl: new Ext.XTemplate('<a id="aProdStock" style="display:none" href="{path}">Disbursement Report (xlsx)</a>'), compiled: !0, data: {
                                                                    path: "/Notification/ProductStockExcelReport"
                                                                }
                                                                , autoScroll: !0
                                                            },
                                                            {
                                                                id: 'wrhbtnPrint', text: 'Print (csv)',
                                                                listeners: {
                                                                    'click': function (btn) {
                                                                        if (Ext.getCmp('grdCurrentProdStock').getStore().getCount() > 0) {
                                                                            window.open(document.getElementById("aProdStock").href, "_blank");
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
                    }
                ]
            }).show();
        }
    });

});