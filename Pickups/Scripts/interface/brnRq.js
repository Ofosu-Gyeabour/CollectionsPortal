Ext.onReady(function () {
    var breditor = new Ext.ux.grid.RowEditor();
    var BIGDATA = [];


    var getProductCategoryList = function (k) {
        var dta = [];
        //Product/getProductCategoryList
        $.getJSON('/Product/getPList', {}, function (r) {
            if (r.status.toString() == "true") {
                $.each(r.msg, function (i, d) {
                    dta[i] = [d.Id, d.productCode, d.productCodeValue, d.categoryValue,d.metric];
                });
                console.log(dta);
                k.getStore().loadData(dta);
            }
        }, "json");
    }

    var computeTotalCost = function (k, arr, rnom,rdes,rdte,rcomm ) {
        $.ajax({
            dataType: 'json',
            url: '/Product/getTotalCost',
            contentType: 'application/json;charset=utf-8',
            traditional: true,
            data: {
                items: arr, oNo: rnom, oDes: rdes, dte: rdte, comm: rcomm
            },
            success: function (response) {
                k.setValue(parseFloat(response.msg.toString()).toFixed(2));
            },
            error: function (response) {
                Ext.Msg.alert('ORDER REQUEST ERROR', response.msg.toString(), this);
            }
        });
    }

    
    
    var bt = Ext.get('brnRq');

    
    bt.on('click', function () {
        var bq = Ext.getCmp('brWindow');

        if (!bq) {
            bq = new Ext.Window({
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
                                id: 'brOrderReq',
                                title: 'ORDER REQUESTS',
                                defaults: { xtype: 'panel', frame: true, border: true }, 
                                items: [
                                    {
                                        defaults: { xtype: 'panel', frame: true, border: true, height: 700 }, layout: 'column',
                                        items: [
                                            {
                                                columnWidth: .5, defaults: { xtype: 'form', frame: true, border: true },
                                                items: [
                                                    {
                                                        id: 'ufrmBRequest', title: 'Branch Request', defaults: { xtype: 'textfield', allowBlank: false, anchor: '90%' },
                                                        items: [
                                                            { id: 'brono', fieldLabel: 'Order No' },
                                                            { id: 'broname', fieldLabel: 'Order Description' },
                                                            { id: 'brdte', xtype: 'datefield', format: 'd/m/Y', fieldLabel: 'Date Requested', allowBlank: false }
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
                                                                plugins: [breditor],
                                                                store: new Ext.data.GroupingStore({
                                                                    reader: new Ext.data.ArrayReader({}, [
                                                                        { name: 'Id', type: 'int' },
                                                                        { name: 'productCode', type: 'string' },
                                                                        { name: 'productCodeValue', type: 'string' },
                                                                        { name: 'categoryValue', type: 'string' },
                                                                        { name: 'metric', type: 'string'},
                                                                        { name: 'qnty', type: 'string' }
                                                                    ]),
                                                                    sortInfo: {
                                                                        field: "productCodeValue",
                                                                        direction: "ASC"
                                                                    },
                                                                    groupField: "productCodeValue"
                                                                }),
                                                                columns: [
                                                                     { id: 'Id', header: 'ID', width: 25, hidden: true, sortable: true, dataIndex: 'Id' },
                                                                     { id: 'productCode', header: 'PRODUCTCODE', width: 250, hidden: true, sortable: true, dataIndex: 'productCode' },
                                                                     { id: 'productCodeValue', header: 'STOCK', width: 250, hidden: false, sortable: true, dataIndex: 'productCodeValue' },
                                                                     { id: 'categoryValue', header: 'CATEGORY', width: 250, hidden: true, sortable: true, dataIndex: 'categoryValue' },
                                                                     {
                                                                         id: 'metric', header: 'METRICS', width: 100, hidden: false, sortable: true, dataIndex: 'metric',
                                                                     },
                                                                     {
                                                                         id: 'qnty', header: 'QTY', width: 100, hidden: false, sortable: true, dataIndex: 'qnty',
                                                                         editor: {
                                                                             xtype: 'numberfield', allowBlank: false, allowNegative: false, minValue: 1, maxValue: 1000
                                                                         }
                                                                     }
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
                                                            { id: 'uComm', emptyText: 'enter brief comments..not mandatory' }
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
                                                                        var ff = Ext.getCmp('ufrmBRequest').getForm();
                                                                        if (ff.isValid()) {
                                                                            var result = [];
                                                                            BIGDATA.length = 0;
                                                                            var orders = [];
                                                                            var ee = Ext.getCmp('grdSelStock').getStore().getRange();
                                                                            var knt = 0;

                                                                            Ext.each(ee, function (item, idx) {
                                                                                if (parseInt(item.get('qnty')) > 0) {
                                                                                    orders[idx] = [item.get('Id'), item.get('productCodeValue'), (item.get('qnty') + ' units of ' + item.get('productCodeValue')), item.get('qnty'), item.get('metric')];
                                                                                    knt++;
                                                                                }
                                                                            });

                                                                            result = orders.filter(function (val) { return val !== undefined; });
                                                                            for (var z = 0; z < result.length; z++) {
                                                                                BIGDATA.push(result[z]);
                                                                            }

                                                                            Ext.getCmp('grdORequests').getStore().loadData(BIGDATA);
                                                                            computeTotalCost(Ext.getCmp('ogrdtotal'), BIGDATA, $('#brono').val(), $('#broname').val(), Ext.fly('brdte').getValue(), Ext.fly('uComm').getValue());
                                                                        }
                                                                        else {
                                                                            Ext.Msg.alert('ORDER REQUEST STATUS', 'Please enter the date requested field', this);
                                                                        }
                                                                    }
                                                                }
                                                            },
                                                            {
                                                                id: 'btnClearBranchRequestStock', text: 'Clear Stock',
                                                                listeners: {
                                                                    'click': function (btn) {
                                                                        Ext.getCmp('ufrmBRequest').getForm().reset();
                                                                        Ext.getCmp('grdSelStock').getStore().removeAll();
                                                                        getProductCategoryList(Ext.getCmp('grdSelStock'));
                                                                    }
                                                                }
                                                            }
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
                                                                        { name: 'productCodeValue', type: 'string' },
                                                                        { name: 'orderDescription', type: 'string' },
                                                                        { name: 'quantity', type: 'string' },
                                                                        { name: 'metric', type: 'string' }
                                                                    ]),
                                                                    sortInfo: {
                                                                        field: "Id",
                                                                        direction: "ASC"
                                                                    },
                                                                    groupField: "Id"
                                                                }),
                                                                columns: [
                                                                     { id: 'Id', header: 'ID', width: 25, hidden: true, sortable: true, dataIndex: 'Id' },
                                                                     { id: 'productCodeValue', header: 'PRODUCTCODE', width: 250, hidden: false, sortable: true, dataIndex: 'productCodeValue' },
                                                                     { id: 'orderDescription', header: 'DESCRIPTION', width: 250, hidden: false, sortable: true, dataIndex: 'orderDescription' },
                                                                     { id: 'quantity', header: 'STOCK', width: 250, hidden: false, sortable: true, dataIndex: 'quantity' },
                                                                     { id: 'metric', header: 'METRIC', width: 250, hidden: false, sortable: true, dataIndex: 'metric' }
                                                                ], stripeRows: true
                                                            })
                                                        ]
                                                    },
                                                    {
                                                        id: 'ufrmGTotal', title: 'Total Amt', defaults: { xtype: 'textfield', anchor: '90%' },
                                                        items: [
                                                            { id: 'ogrdtotal', fieldLabel: 'Grand Total', style: { 'font-size': '20px', 'color': 'red', 'text-align': 'center' } }
                                                        ]
                                                    },
                                                    {
                                                        id: '', title: 'Actions',
                                                        items: [],
                                                        buttons: [
                                                            {
                                                                id: 'obtnSend', text: 'Send Order Requests',
                                                                listeners: {
                                                                    'click': function (btn) {
                                                                        var r = new Ext.LoadMask(Ext.getCmp("brWindow").el, {
                                                                            msg: "Saving Order Request to Database.Please wait..."
                                                                        });
                                                                        r.show();

                                                                        if (Ext.getCmp('grdORequests').getStore().getCount() > 0) {
                                                                            $.post('/Product/saveOrderItems', { oNo: Ext.fly('brono').getValue(), statusId: 1 }, function (rsp) {
                                                                                if (rsp.status.toString() == "true") {
                                                                                    r.hide();
                                                                                    Ext.Msg.alert('ORDER REQUESTS', rsp.msg.toString(), this);
                                                                                    //$('#rqBtnOrderClr').trigger('click');
                                                                                    $('#obtnClear').trigger('click');
                                                                                }
                                                                                else { r.hide(); }
                                                                            }, "json");
                                                                        }
                                                                    }
                                                                }
                                                            },
                                                            {
                                                                id: 'obtnClear', text: 'Clear Order Requests',
                                                                listeners: {
                                                                    'click': function (btn) {
                                                                        Ext.getCmp('ufrmBRequest').getForm().reset();
                                                                        Ext.getCmp('grdSelStock').getStore().removeAll();
                                                                        Ext.getCmp('ufrmComments').getForm().reset();
                                                                        Ext.getCmp('grdORequests').getStore().removeAll();
                                                                        Ext.getCmp('ufrmGTotal').getForm().reset();

                                                                        $.getJSON('/Helper/generateOrderNumber', { TTYPE: 'ORD' }, function (rsp) {
                                                                            if (rsp.status.toString() == "true") {
                                                                                $('#brono').val(rsp.msg.toString()).attr('readonly', true);
                                                                                $('#broname').val('REQUISITION').attr('readonly', true);
                                                                            }
                                                                        });

                                                                        getProductCategoryList(Ext.getCmp('grdSelStock'));
                                                                    }
                                                                }
                                                            }
                                                        ]
                                                    }
                                                ]
                                            }
                                        ]
                                    },//END OF ORDER REQUESTS...START OF NON-FUNCTIONAL CODE

                                ]
                            },//END OF ORDER REQUESTS



                            {
                                id: 'brOrderRecdx',
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
                                                        id: 'cboOrderRec', anchor: '90%',
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
                                                                Ext.getCmp('grdBrReqStatusx').getStore().removeAll();
                                                                $.getJSON('/Helper/getOrderRecords', { stat: Ext.getCmp('cboOrderRec').getValue() }, function (dta) {
                                                                    var a = [];
                                                                    if (dta.status.toString() == "true") {
                                                                        $.each(dta.msg, function (i, d) {
                                                                            a[i] = [d.Id, d.orderNumber, d.orderstatus_Id.statusDescription, d.branchId.branchName, d.usrId.username];
                                                                        });

                                                                        Ext.getCmp('grdBrReqStatusx').getStore().loadData(a);
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
                                                        id: 'grdBrReqStatusx', title: '', height: 550, autoScroll: true,
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

                                                                Ext.get('brOrderRecdx').unmask('Retrieving order request from Database.Please wait...');
                                                                var rec = e.getStore().getAt(t);
                                                                $('#brcodex').val(rec.get('orderNumber')).attr('readonly', true);
                                                                $('#brbranchx').val(rec.get('branchName')).attr('readonly', true);
                                                                $('#brinputterx').val(rec.get('username')).attr('readonly', true);

                                                                Ext.getCmp('frmDisbDx').getForm().reset();
                                                                Ext.getCmp('frmDisbx').getForm().reset();


                                                                $.getJSON('/Helper/getSelectedOrderList', { id: parseInt(rec.get('Id')), orderCode: rec.get('orderNumber') }, function (rs) {
                                                                    $('#btorderDetx').val(rs.msg.toString()).attr('readonly', true);
                                                                });
                                                                Ext.get('brOrderRecdx').unmask();
                                                                $.getJSON('/Helper/getDisbursementList', { id: parseInt(rec.get('Id')), orderCode: rec.get('orderNumber') }, function (xy) {

                                                                    if (xy.msg.toString() != "Object reference not set to an instance of an object.")
                                                                    { $('#brorderDetx').val(xy.msg.toString()).attr('readonly', true); }

                                                                    if (xy.status.toString() == "true") {
                                                                        $.each(xy.disb, function (i, d) {
                                                                            $('#brdisbcodex').val(d.disbursementNo.toString()).attr('readonly', true);
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
                                                            { id: 'brcodex', fieldLabel: 'Request Code' },
                                                            { id: 'brbranchx', fieldLabel: 'Branch' },
                                                            { id: 'brinputterx', fieldLabel: 'Inputter' }
                                                        ]
                                                    },
                                                    {
                                                        id: 'frmDt', title: 'Details', layout: 'fit', height: 490,
                                                        items: [
                                                            {
                                                                id: 'btorderDetx', xtype: 'textarea', autoScroll: true,
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
                                                        id: 'frmDisbx', defaults: { xtype: 'textfield', anchor: '90%' },
                                                        items: [
                                                            { id: 'brdisbcodex', fieldLabel: 'Disb. Code' }
                                                        ]
                                                    },
                                                    {
                                                        id: 'frmDisbDx', defaults: { xtype: 'textarea' }, layout: 'fit', height: 500,
                                                        items: [
                                                            {
                                                                id: 'brorderDetx', xtype: 'textarea', autoScroll: true,
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
                                                                        if ($('#brdisbcodex').val().length > 0) {
                                                                            $.post('/Product/receiveStockAtBranch',
                                                                                { orderCode: Ext.fly('brcodex').getValue(), orderStatus: 4, metadta: [] }, function (r) {
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
                                                                        Ext.getCmp('frmDisbx').getForm().reset();
                                                                        Ext.getCmp('frmDisbDx').getForm().reset();
                                                                        Ext.getCmp('grdBrReqStatusx').getStore().removeAll();
                                                                        $('#cboOrderRec').val('').focus();
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
                            //END OF ORDER RECEIVED
                        ]
                    }
                ]
            }).show();
        }
    });

});