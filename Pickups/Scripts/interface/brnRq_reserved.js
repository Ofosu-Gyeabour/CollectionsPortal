Ext.onReady(function () {
    var editor = new Ext.ux.grid.RowEditor();

    var getProductCategoryList = function (k) {
        var dta = [];
        $.getJSON('/Product/getProductCategoryList', {}, function (r) {
            if (r.status.toString() == "true") {
                $.each(r.msg, function (i, d) {
                    dta[i] = [d.Id, d.productCode, d.productCodeValue, d.parentCategoryLookup.categoryValue];
                });
                k.getStore().loadData(dta);
            }
        }, "json");
    }

    var bt = Ext.get('brnRq');

    var win;
    bt.on('click', function () {

        win = new Ext.Window({
            id: 'brWindow',
            height: 700,
            width: 1100,
            collapsible: false,
            resizable: false,
            closable: true,
            title: 'BRANCH REQUEST FORM',
            defaults: { xtype: 'tabpanel', tabPosition: 'bottom', enableScroll: true, frame: true, height: 670 },
            items: [
                {
                    activeTab: 0,
                    items: [
                        {
                            id: '',
                            title: 'ORDER REQUESTS',
                            defaults: { xtype: 'panel', frame: true, border: true }, layout: 'column',
                            items: [
                                {
                                    title: 'Branch Requests', width: '50%',
                                    defaults: { xtype: 'form', frame: true, border: true },
                                    items: [
                                        {
                                            id: 'frmProc', defaults: { xtype: 'textfield', anchor: '90%' },
                                            items: [
                                                { id: 'ono', fieldLabel: 'Order No' },
                                                { id: 'oname', fieldLabel: 'Order Description' }
                                            ]
                                        },
                                        {
                                            id: 'frmStock', title: 'select stock', defaults: { xtype: 'combo', mode: 'local', anchor: '90%' },
                                            items: [
                                                {
                                                    id: 'oStkn', fieldLabel: 'Stock',
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
                                                    id: 'omtrx', fieldLabel: 'Metrics',
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
                                            id: 'frmFigures', defaults: { xtype: 'numberfield', anchor: '90%' },
                                            items: [
                                                { xtype: 'numberfield', fieldLabel: 'Qty Requested', id: 'oqtr' },
                                                { xtype: 'datefield', fieldLabel: 'Date Requested', id: 'odtr' },
                                                { xtype: 'textarea', fieldLabel: 'Comments', id: 'ocomments' },
                                            ],
                                            buttons: [
                                                {
                                                    id: '', text: 'Add Stock',
                                                    listeners: {
                                                        'click': function (btn) {
                                                            var pr = Ext.getCmp('frmProc').getForm();
                                                            var stk = Ext.getCmp('frmStock').getForm();
                                                            var fig = Ext.getCmp('frmFigures').getForm();

                                                            if (pr.isValid() && stk.isValid() && fig.isValid()) {
                                                                $.post('/Product/addOrderReportItem',
                                                                    {
                                                                        oNo: Ext.fly('ono').getValue(), oDes: Ext.fly('oname').getValue(), prod: Ext.fly('oStkn').getValue(),
                                                                        metx: Ext.fly('omtrx').getValue(), qty: Ext.fly('oqtr').getValue(),
                                                                        dte: Ext.fly('odtr').getValue(), comm: Ext.fly('ocomments').getValue()
                                                                    },
                                                                    function (rsp) {
                                                                        if (rsp.status.toString() == "true") {
                                                                            var a = [];
                                                                            $.each(rsp.msg, function (i, d) {
                                                                                a[i] = [d.Id, d.orderDescription, d.Quantity];
                                                                            });

                                                                            Ext.getCmp('grdList').getStore().loadData(a);
                                                                            Ext.getCmp('frmStock').getForm().reset();
                                                                            Ext.getCmp('frmFigures').getForm().reset();
                                                                            $('#ono').attr('readonly', 'readonly');
                                                                        }
                                                                    }, "json");
                                                            }
                                                        }
                                                    }
                                                },
                                                {
                                                    id: 'rqBtnClr', text: 'Clear Stock',
                                                    listeners: {
                                                        'click': function (btn) {
                                                            $.post('/Product/clearOrderItems', {}, function (r) {
                                                                if (r.toString() == "true") {

                                                                    Ext.getCmp('grdList').getStore().removeAll();
                                                                }
                                                            }, "json");

                                                            $('#oname').val('').focus();
                                                        }
                                                    }
                                                }
                                            ]
                                        }
                                    ],
                                    listeners: {
                                        'afterrender': function () {
                                            //$('#ono').val('ORD/TESTING').attr('readonly', true);
                                            $.getJSON('/Helper/generateOrderNumber', { TTYPE: 'ORD' }, function (rsp) {
                                                if (rsp.status.toString() == "true") {
                                                    $('#ono').val(rsp.msg.toString()).attr('readonly', true);
                                                    $('#oname').val('REQUISITION').attr('readonly', true);
                                                }
                                            });
                                        }
                                    }
                                },
                                {
                                    id: '', title: 'Order Requests', defaults: { xtype: 'form', border: true }, width: '50%', layout: 'form',
                                    items: [
                                        new Ext.grid.GridPanel({
                                            id: 'grdList', title: '', height: 370, autoScroll: true,
                                            store: new Ext.data.GroupingStore({
                                                reader: new Ext.data.ArrayReader({}, [
                                                    { name: 'Id', type: 'int' },
                                                    { name: 'orderDescription', type: 'string' },
                                                    { name: 'Quantity', type: 'string' }
                                                ]),
                                                sortInfo: {
                                                    field: "Id",
                                                    direction: "ASC"
                                                },
                                                groupField: "Id"
                                            }),
                                            columns: [
                                                 { id: 'Id', header: 'ID', width: 25, hidden: true, sortable: true, dataIndex: 'Id' },
                                                 { id: 'orderDescription', header: '', width: 450, hidden: false, sortable: true, dataIndex: 'orderDescription' },
                                                 { id: 'Quantity', header: '', width: 60, hidden: false, sortable: true, dataIndex: 'Quantity' }
                                            ], stripeRows: true,
                                            listeners: {
                                                'afterrender': function () {
                                                    var k = 1;
                                                    var d = [];
                                                    setInterval(function () {
                                                        //alert('testing');
                                                        while (k < 100) {
                                                            d[k] = [k, 'testing one two three', 'some unit', '3000'];
                                                            k = k + 1;
                                                            //console.log(d);
                                                            Ext.getCmp('grdList').getStore().loadData(d);
                                                        }


                                                    }, 5000);
                                                },
                                                'rowdblclick': function (e, t) {
                                                    var _str = e.getStore().getAt(t);
                                                    Ext.getCmp('grdList').getStore().removeAll();
                                                    console.log(_str.get('Id'));
                                                    $.post('/Product/removeOrderItem', { idx: _str.get('Id'), des: _str.get('orderDescription') }, function (rsp) {
                                                        if (rsp.status.toString() == "true") {
                                                            var a = [];
                                                            $.each(rsp.msg, function (i, d) {
                                                                a[i] = [d.Id, d.orderDescription, d.Quantity];
                                                            });

                                                            console.log(a);
                                                            Ext.getCmp('grdList').getStore().loadData(a);
                                                        }
                                                    }, "json");
                                                }
                                            }
                                        })
                                    ]
                                },
                                {
                                    id: '',
                                    items: [],
                                    buttons: [
                                        {
                                            id: '', text: 'Send Order Request',
                                            listeners: {
                                                'click': function (btn) {

                                                    var r = new Ext.LoadMask(Ext.getCmp("brWindow").el, {
                                                        msg: "Saving Order Request to Database.Please wait..."
                                                    });
                                                    r.show();

                                                    if (Ext.getCmp('grdList').getStore().getCount() > 0) {
                                                        $.post('/Product/saveOrderItems', { oNo: Ext.fly('ono').getValue(), statusId: 1 }, function (rsp) {
                                                            if (rsp.status.toString() == "true") {
                                                                r.hide();
                                                                Ext.Msg.alert('ORDER REQUESTS', rsp.msg.toString(), this);
                                                                $('#rqBtnOrderClr').trigger('click');
                                                            }
                                                        }, "json");
                                                    }
                                                }
                                            }
                                        },
                                        {
                                            id: 'rqBtnOrderClr', text: 'Clear Order Request',
                                            listeners: {
                                                'click': function (btn) {
                                                    $.post('/Product/clearOrderItems', {}, function (r) {
                                                        if (r.toString() == "true") {
                                                            Ext.getCmp('frmProc').getForm().reset();
                                                            Ext.getCmp('frmStock').getForm().reset();
                                                            Ext.getCmp('frmFigures').getForm().reset();
                                                            Ext.getCmp('grdList').getStore().removeAll();

                                                            $('#ono').attr('readonly', false).val('').focus();
                                                        }
                                                    }, "json");

                                                    $.getJSON('/Helper/generateOrderNumber', {}, function (rsp) {
                                                        if (rsp.status.toString() == "true") {
                                                            $('#ono').val(rsp.msg.toString()).attr('readonly', true);
                                                        }
                                                    });
                                                }
                                            }
                                        }
                                    ]
                                }
                            ]
                        },
                        /**/
                        {
                            id: 'brOrderRecd',
                            title: 'ORDER RECEIVED',
                            defaults: { xtype: 'panel', frame: true, border: true }, layout: 'column',
                            items: [
                                {
                                    id: '', title: '', width: '30%', height: 650, defaults: { xtype: 'form', frame: true, border: true }, layout: 'form',
                                    items: [
                                        {
                                            id: '', title: 'Order Status', defaults: { xtype: 'combo', forceSelection: true, typeAhead: true, mode: 'local' }, layout: 'fit',
                                            items: [
                                                {
                                                    id: 'cboOrder', anchor: '90%',
                                                    store: new Ext.data.Store({
                                                        autoLoad: true, restful: false,
                                                        url: '/Helper/getOrderStatus',
                                                        reader: new Ext.data.JsonReader({ type: 'json', root: 'msg' }, [
                                                            { name: 'Id', type: 'int' },
                                                            { name: 'statusDescription', type: 'string' }
                                                        ])
                                                    }), valueField: 'Id', displayField: 'statusDescription',
                                                    listeners: {
                                                        'select': function () {
                                                            Ext.getCmp('grdBrReqStatus').getStore().removeAll();
                                                            $.getJSON('/Helper/getOrderRecords', { stat: Ext.getCmp('cboOrder').getValue() }, function (dta) {
                                                                var a = [];
                                                                if (dta.status.toString() == "true") {
                                                                    $.each(dta.msg, function (i, d) {
                                                                        a[i] = [d.Id, d.orderNumber, d.orderstatus_Id.statusDescription, d.branchId.branchName, d.usrId.username];
                                                                    });

                                                                    Ext.getCmp('grdBrReqStatus').getStore().loadData(a);
                                                                }
                                                            });
                                                        }
                                                    }
                                                }
                                            ]
                                        },
                                        {
                                            id: '',
                                            items: [
                                                new Ext.grid.GridPanel({
                                                    id: 'grdBrReqStatus', title: '', height: 550, autoScroll: true,
                                                    store: new Ext.data.GroupingStore({
                                                        reader: new Ext.data.ArrayReader({}, [
                                                            { name: 'Id', type: 'int' },
                                                            { name: 'orderNumber', type: 'string' },
                                                            { name: 'statusDescription', type: 'string' },
                                                            { name: 'branchName', type: 'string' },
                                                            { name: 'username', type: 'string' }
                                                        ]),
                                                        sortInfo: {
                                                            field: "Id",
                                                            direction: "ASC"
                                                        },
                                                        groupField: "Id"
                                                    }),
                                                    columns: [
                                                         { id: 'Id', header: 'ID', width: 25, hidden: true, sortable: true, dataIndex: 'Id' },
                                                         { id: 'orderNumber', header: 'ORDERNo', width: 350, hidden: false, sortable: true, dataIndex: 'orderNumber' },
                                                         { id: 'statusDescription', header: 'DESCRIPTION', width: 160, hidden: true, sortable: true, dataIndex: 'statusDescription' },
                                                         { id: 'branchName', header: 'BRANCH', width: 160, hidden: true, sortable: true, dataIndex: 'branchName' },
                                                         { id: 'username', header: 'USER', width: 160, hidden: true, sortable: true, dataIndex: 'username' }
                                                    ], stripeRows: true,
                                                    viewConfig: {
                                                        getRowClass: function (record, rowIndex, rowParams, store) {
                                                            return ((rowIndex % 2) == 0) ? "even-class" : "odd-class";
                                                        }
                                                    },
                                                    listeners: {
                                                        'rowdblclick': function (e, t) {

                                                            Ext.get('brOrderRecd').unmask('Retrieving order request from Database.Please wait...');
                                                            var rec = e.getStore().getAt(t);
                                                            $('#brcode').val(rec.get('orderNumber')).attr('readonly', true);
                                                            $('#brbranch').val(rec.get('branchName')).attr('readonly', true);
                                                            $('#brinputter').val(rec.get('username')).attr('readonly', true);

                                                            Ext.getCmp('frmDisbD').getForm().reset();
                                                            Ext.getCmp('frmDisb').getForm().reset();


                                                            $.getJSON('/Helper/getSelectedOrderList', { id: parseInt(rec.get('Id')), orderCode: rec.get('orderNumber') }, function (rs) {
                                                                $('#btorderDet').val(rs.msg.toString()).attr('readonly', true);
                                                            });
                                                            Ext.get('brOrderRecd').unmask();
                                                            $.getJSON('/Helper/getDisbursementList', { id: parseInt(rec.get('Id')), orderCode: rec.get('orderNumber') }, function (xy) {

                                                                if (xy.msg.toString() != "Object reference not set to an instance of an object.")
                                                                { $('#brorderDet').val(xy.msg.toString()).attr('readonly', true); }

                                                                if (xy.status.toString() == "true") {
                                                                    $.each(xy.disb, function (i, d) {
                                                                        $('#brdisbcode').val(d.disbursementNo.toString()).attr('readonly', true);
                                                                    });
                                                                }
                                                            });

                                                        }

                                                    }
                                                })
                                            ]
                                        }
                                    ]
                                },
                                {
                                    id: '', title: '', width: '70%', defaults: { xtype: 'panel', frame: true, border: true }, layout: 'column',
                                    items: [
                                        {
                                            width: '50%', title: 'Branch Request', defaults: { xtype: 'form', frame: true, border: true },
                                            items: [
                                                {
                                                    id: 'frmRq', defaults: { xtype: 'textfield', anchor: '90%' },
                                                    items: [
                                                        { id: 'brcode', fieldLabel: 'Request Code' },
                                                        { id: 'brbranch', fieldLabel: 'Branch' },
                                                        { id: 'brinputter', fieldLabel: 'Inputter' }
                                                    ]
                                                },
                                                {
                                                    id: 'frmDt', title: 'Details', layout: 'fit', height: 490,
                                                    items: [
                                                        {
                                                            id: 'btorderDet', xtype: 'textarea', autoScroll: true,
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
                                            width: '50%', title: 'Disbursed Items', defaults: { xtype: 'form', frame: true, border: true }, layout: 'form',
                                            items: [
                                                {
                                                    id: 'frmDisb', defaults: { xtype: 'textfield', anchor: '90%' },
                                                    items: [
                                                        { id: 'brdisbcode', fieldLabel: 'Disb. Code' }
                                                    ]
                                                },
                                                {
                                                    id: 'frmDisbD', defaults: { xtype: 'textarea' }, layout: 'fit', height: 500,
                                                    items: [
                                                        {
                                                            id: 'brorderDet', xtype: 'textarea', autoScroll: true,
                                                            style: {
                                                                'font-size': '13px',
                                                                'background-color': 'lightblue'
                                                            }
                                                        }
                                                    ],
                                                    buttons: [
                                                        {
                                                            id: '', text: 'Receive',
                                                            listeners: {
                                                                'click': function (btn) {
                                                                    if ($('#brdisbcode').val().length > 0) {
                                                                        $.post('/Product/receiveStockAtBranch',
                                                                            { orderCode: Ext.fly('brcode').getValue(), orderStatus: 3 }, function (r) {
                                                                                if (r.status.toString() == "true") {
                                                                                    Ext.Msg.alert('BRANCH REQUEST', r.msg.toString(), this);
                                                                                    $('#xBtnClrAll').trigger('click');
                                                                                }
                                                                            }, "json");
                                                                    }
                                                                    else {
                                                                        Ext.Msg.alert('REQUEST NOT PROCESSED', 'Stores Department yet to process order', this);
                                                                    }
                                                                }
                                                            }
                                                        },
                                                        {
                                                            id: 'xBtnClrAll', text: 'Clear',
                                                            listeners: {
                                                                'click': function () {
                                                                    Ext.getCmp('frmRq').getForm().reset();
                                                                    Ext.getCmp('frmDt').getForm().reset();
                                                                    Ext.getCmp('frmDisb').getForm().reset();
                                                                    Ext.getCmp('frmDisbD').getForm().reset();
                                                                    Ext.getCmp('grdBrReqStatus').getStore().removeAll();
                                                                    $('#cboOrder').val('').focus();
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
                        },
                        {
                            title: 'ORDER USAGE', defaults: { xtype: 'panel', frame: true, border: true, height: 700 }, layout: 'column',
                            items: [
                                {
                                    columnWidth: .5, defaults: { xtype: 'form', frame: true, border: true },
                                    items: [
                                        {
                                            id: 'ufrmBRequest', title: 'Branch Request', defaults: { xtype: 'textfield', allowBlank: false, anchor: '90%' },
                                            items: [
                                                { id: 'brono', fieldLabel: 'Order No' },
                                                { id: 'broname', fieldLabel: 'Order Description' },
                                                { xtype: 'datefield', format: 'd/m/Y', fieldLabel: 'Date Requested' }
                                            ],
                                            listeners: {
                                                'render': function () {
                                                    $.getJSON('/Helper/generateOrderNumber', { TTYPE: 'ORD' }, function (rsp) {
                                                        if (rsp.status.toString() == "true") {
                                                            $('#brono').val(rsp.msg.toString()).attr('readonly', true);
                                                            $('#broname').val('REQUISITION').attr('readonly', true);
                                                        }
                                                    });
                                                }
                                            }
                                        },
                                        {
                                            id: 'ufrmStock', title: 'Select Stock',
                                            items: [
                                                new Ext.grid.GridPanel({
                                                    id: 'grdSelStock', title: '', height: 300, autoScroll: true, autoExpandColumn: 'productCodeValue',
                                                    plugins: [editor],
                                                    store: new Ext.data.GroupingStore({
                                                        reader: new Ext.data.ArrayReader({}, [
                                                            { name: 'Id', type: 'int' },
                                                            { name: 'productCode', type: 'string' },
                                                            { name: 'productCodeValue', type: 'string' },
                                                            { name: 'categoryValue', type: 'string' },
                                                            { name: 'qty', type: 'string' }
                                                        ]),
                                                        sortInfo: {
                                                            field: "Id",
                                                            direction: "ASC"
                                                        },
                                                        groupField: "Id"
                                                    }),
                                                    columns: [
                                                         { id: 'Id', header: 'ID', width: 25, hidden: true, sortable: true, dataIndex: 'Id' },
                                                         { id: 'productCode', header: 'PRODUCTCODE', width: 250, hidden: true, sortable: true, dataIndex: 'productCode' },
                                                         { id: 'productCodeValue', header: 'STOCK', width: 250, hidden: false, sortable: true, dataIndex: 'productCodeValue' },
                                                         { id: 'categoryValue', header: 'CATEGORY', width: 250, hidden: true, sortable: true, dataIndex: 'categoryValue' },
                                                         {
                                                             id: 'metric', header: 'METRICS', width: 100, hidden: false, sortable: true, dataIndex: 'metric',
                                                             editor: {
                                                                 xtype: 'combo', forceSelection: true, typeAhead: true, mode: 'local', allowBlank: false,
                                                                 store: new Ext.data.Store({
                                                                     autoLoad: true, restful: false,
                                                                     url: '/Helper/getMetrics',
                                                                     reader: new Ext.data.JsonReader({}, [
                                                                         { name: 'Id', type: 'int' },
                                                                         { name: 'metric_name', type: 'string' }
                                                                     ])
                                                                 }), displayField: 'metric_name', valueField: 'metric_name'
                                                             }
                                                         },
                                                         { id: 'qty', header: 'QTY', width: 100, hidden: false, sortable: true, dataIndex: 'qty', editor: { xtype: 'numberfield', allowBlank: false, allowNegative: false, minValue: 0, maxValue: 10000 } }
                                                    ], stripeRows: true,
                                                    listeners: {
                                                        'render': function () {
                                                            getProductCategoryList(Ext.getCmp('grdSelStock'));
                                                        }
                                                    }
                                                })
                                            ]
                                        },
                                        {
                                            id: 'ufrmComments', height: 100, defaults: { xtype: 'textarea', anchor: '90%' }, layout: 'fit',
                                            items: [
                                                { id: '', emptyText: 'enter brief comments..not mandatory' }
                                            ]
                                        },
                                        {
                                            id: '',
                                            items: [],
                                            buttons: [
                                                {
                                                    id: '', text: 'Add Stock',
                                                    listeners: {
                                                        'click': function (btn) {
                                                            var BIGDATA = [];
                                                            BIGDATA.length = 0;

                                                            var orders = [];
                                                            var ee = Ext.getCmp('grdSelStock').getStore().getRange();
                                                            Ext.each(ee, function (item, idx) {
                                                                if (parseInt(item.get('qty')) > 0 && item.get('metric').toString().length > 0) {
                                                                    orders[idx] = [item.get('Id'), item.get('metric'), item.get('qty')];
                                                                }
                                                            });

                                                            console.log(orders.length); return false;
                                                            for (var i = 0; i < orders.length; i++) {
                                                                BIGDATA.push(stage[i]);
                                                            }
                                                            console.log(orders);
                                                            Ext.getCmp('grdORequests').getStore().loadData(orders);
                                                        }
                                                    }
                                                },
                                                { id: '', text: 'Clear Stock' }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    columnWidth: .5, defaults: { xtype: 'form', frame: true, border: true },
                                    items: [
                                        {
                                            id: '', title: 'Order Requests',
                                            items: [
                                                new Ext.grid.GridPanel({
                                                    id: 'grdORequests', title: '', height: 300, autoScroll: true,
                                                    store: new Ext.data.GroupingStore({
                                                        reader: new Ext.data.ArrayReader({}, [
                                                            { name: 'Id', type: 'int' },
                                                            { name: 'orderDescription', type: 'string' },
                                                            { name: 'quantity', type: 'string' }
                                                        ]),
                                                        sortInfo: {
                                                            field: "Id",
                                                            direction: "ASC"
                                                        },
                                                        groupField: "Id"
                                                    }),
                                                    columns: [
                                                         { id: 'Id', header: 'ID', width: 25, hidden: true, sortable: true, dataIndex: 'Id' },
                                                         { id: 'orderDescription', header: 'PRODUCTCODE', width: 250, hidden: false, sortable: true, dataIndex: 'orderDescription' },
                                                         { id: 'quantity', header: 'STOCK', width: 250, hidden: false, sortable: true, dataIndex: 'quantity' }
                                                    ], stripeRows: true
                                                })
                                            ]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            title: 'RETURN STOCK'
                        }

                    ]
                }
            ]
        }).show();

    });

});