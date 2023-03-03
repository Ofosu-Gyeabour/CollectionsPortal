Ext.onReady(function () {
    var PackaginEeditor = new Ext.ux.grid.RowEditor();

    var getOrderRecords = function(ktrl){
        $.getJSON('/Helper/getOrderRecords', {stat: 2}, function (xr) {
            if (xr.status.toString() == "true") {
                var a = [];
                $.each(xr.msg, function (i, d) {
                    a[i] = [d.Id, d.orderNumber, d.orderstatus_Id.statusDescription, d.branchId.branchName, d.usrId.username];
                });
                Ext.getCmp('grdBrPackaging').getStore().loadData(a);
            }
        });
    };

    var bt = Ext.get('PckgAdm');

    
    bt.on('click', function () {
        var PckgWin = Ext.getCmp('brWindow');
        if (!PckgWin) {

            PckgWin = new Ext.Window({
                id: 'brWindow',
                height: 700,
                width: 1100,
                collapsible: false,
                resizable: false,
                closable: true,
                title: 'ORDER PACKAGING FORM',
                defaults: { xtype: 'tabpanel', tabPosition: 'bottom', enableScroll: true, frame: true, height: 670 },
                items: [
                    {
                        activeTab: 0,
                        items: [
                            /**/
                            {
                                id: 'brPackagingWdw',
                                title: 'PACKAGING',
                                defaults: { xtype: 'panel', frame: true, border: true }, layout: 'column',
                                items: [
                                    {
                                        id: '', title: '', width: '30%', height: 650, defaults: { xtype: 'form', frame: true, border: true }, layout: 'form',
                                        items: [
                                            {
                                                id: '',
                                                items: [
                                                    {
                                                        defaults: { xtype: 'combo', forceSelection: true, typeAhead: true, allowBlank: false, mode: 'local' },layout: 'fit',
                                                        items: [
                                                            {
                                                                id: 'pckCbo',
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
                                                                        $.getJSON('/Helper/getOrderRecordsForBusinessUnit', { BID: Ext.getCmp('pckCbo').getValue(), stat: 2 }, function (xr) {
                                                                            if (xr.status.toString() == "true") {
                                                                                var ans = [];
                                                                                $.each(xr.msg, function (i, d) {
                                                                                        ans[i] = [d.Id, d.orderNumber, d.orderstatus_Id.statusDescription, d.branchId.branchName, d.usrId.username];
                                                                                });

                                                                                Ext.getCmp('grdBrPackaging').getStore().loadData(ans);
                                                                            }
                                                                        });
                                                                    }
                                                                }
                                                            }
                                                        ]
                                                    },
                                                    new Ext.grid.GridPanel({
                                                        id: 'grdBrPackaging', title: '', height: 550, autoScroll: true,
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
                                                            'render': function () {
                                                                getOrderRecords(Ext.getCmp('grdBrPackaging'))
                                                            },
                                                            'afterrender': function () {
                                                                setInterval(function () {
                                                                    getOrderRecords(Ext.getCmp('grdBrPackaging'))
                                                                }, 60000);
                                                            },
                                                            'rowdblclick': function (e, t) {
                                                                var packagingResult = [];
                                                                Ext.get('brPackagingWdw').unmask('Retrieving order request from Database.Please wait...');
                                                                var rec = e.getStore().getAt(t);
                                                                $('#brcode').val(rec.get('orderNumber')).attr('readonly', true);
                                                                $('#brbranch').val(rec.get('branchName')).attr('readonly', true);
                                                                $('#brinputter').val(rec.get('username')).attr('readonly', true);

                                                                Ext.getCmp('frmDisbD').getForm().reset();

                                                                $.getJSON('/Helper/getSelectedOrderList', { id: parseInt(rec.get('Id')), orderCode: rec.get('orderNumber') }, function (rs) {
                                                                    $('#btorderDet').val(rs.msg.toString()).attr('readonly', true);

                                                                    packagingResult.length = 0;
                                                                    $.each(rs.extraData, function (idx, dt) {
                                                                        packagingResult[idx] = [dt.Id, dt.product_Id.productCodeValue];
                                                                    });

                                                                    Ext.getCmp('grdWayBill').getStore().loadData(packagingResult);
                                                                });

                                                                Ext.get('brPackagingWdw').unmask();
                                                                $.getJSON('/Helper/getDisbursementList', { id: parseInt(rec.get('Id')), orderCode: rec.get('orderNumber') }, function (xy) {

                                                                    if (xy.msg.toString() != "Object reference not set to an instance of an object.")
                                                                    { $('#brorderDet').val(xy.msg.toString()).attr('readonly', true); }

                                                                    if (xy.status.toString() == "true") {
                                                                        $.each(xy.disb, function (i, d) {
                                                                            Ext.getCmp('frmDisbD').setTitle(d.disbursementNo.toString());
                                                                            $('#disbfield').val(d.disbursementNo.toString());
                                                                        });
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
                                                                getOrderRecords(Ext.getCmp('grdBrPackaging'))
                                                                $('#xBtnClrAll').trigger('click');
                                                            }
                                                        }
                                                    }
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
                                                width: '50%', title: 'Disbursed Product List', height: 650, defaults: { xtype: 'form', frame: true, border: true }, layout: 'accordion',
                                                items: [
                                                    {
                                                        id: 'frmDisbD', height: 350, defaults: { xtype: 'textarea', anchor: '90%' }, layout: 'fit',
                                                        items: [
                                                            {
                                                                id: 'brorderDet', xtype: 'textarea', autoScroll: true,
                                                                style: {
                                                                    'font-size': '13px',
                                                                    'background-color': 'lightblue'
                                                                }
                                                            },
                                                            { xtype: 'textarea', id: 'disbfield', hidden: true }
                                                        ]
                                                    },
                                                    {
                                                        id: 'frmPWaybill', title: 'Attach Waybill', height: 200,
                                                        items: [
                                                            new Ext.grid.GridPanel({
                                                                id: 'grdWayBill', title: '', height: 300, autoScroll: true, autoExpandColumn: 'waybill',
                                                                plugins: [PackaginEeditor],
                                                                store: new Ext.data.GroupingStore({
                                                                    reader: new Ext.data.ArrayReader({}, [
                                                                        { name: 'Id', type: 'int' },
                                                                        { name: 'product', type: 'string' }
                                                                    ]),
                                                                    sortInfo: {
                                                                        field: "Id",
                                                                        direction: "ASC"
                                                                    },
                                                                    groupField: "Id"
                                                                }),
                                                                columns: [
                                                                     { id: 'Id', header: 'ID', width: 25, hidden: true, sortable: true, dataIndex: 'Id' },
                                                                     { id: 'product', header: 'PRODUCT', width: 200, hidden: false, sortable: true, dataIndex: 'product' },
                                                                     {
                                                                         id: 'waybill', header: 'WAYBILL', width: 200, hidden: false, sortable: true, dataIndex: 'waybill',
                                                                         editor: { xtype: 'textfield', allowBlank: true }
                                                                     }
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
                                                                id: '', text: 'Save',
                                                                listeners: {
                                                                    'click': function (btn) {
                                                                        var receiveParam = [];
                                                                        var eReceive = Ext.getCmp('grdWayBill').getStore().getRange();
                                                                        Ext.each(eReceive, function (d, i) {
                                                                            receiveParam[i] = [d.data.Id, d.data.product, d.data.waybill];
                                                                        });


                                                                        if ($('#disbfield').val().length > 0) {
                                                                            $.ajax({
                                                                                dataType: 'json',
                                                                                url: '/Product/receiveStockAtBranch',
                                                                                contentType: 'application/json;charset=utf-8',
                                                                                traditional: true,
                                                                                data: {
                                                                                    orderCode: Ext.fly('brcode').getValue(), orderStatus: 3, metadta: receiveParam
                                                                                },
                                                                                success: function (data, status, xhttp) {
                                                                                    if (data.status.toString() == "true") {
                                                                                        Ext.Msg.alert('BRANCH REQUEST', 'Order is packaged and ready for transport to Business Unit', this);
                                                                                        $('#xBtnClrAll').trigger('click');
                                                                                        getOrderRecords(Ext.getCmp('grdBrPackaging'));
                                                                                    }
                                                                                },
                                                                                error: function (data, status, xhttp) {
                                                                                    Ext.Msg.alert('REQUEST NOT PROCESSED', 'Stores Department yet to process order', this);
                                                                                }
                                                                            });
                                                                        }
                                                                        else {
                                                                            Ext.Msg.alert('REQUEST NOT PROCESSED', 'Stores Department yet to process order, OR no order to process at the moment', this);
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
                                                                        //Ext.getCmp('frmDisb').getForm().reset();
                                                                        Ext.getCmp('frmDisbD').getForm().reset();
                                                                        //Ext.getCmp('grdBrPackaging').getStore().removeAll();
                                                                        Ext.getCmp('grdWayBill').getStore().removeAll();
                                                                        $('#cboOrder').val('');
                                                                        $('#pckCbo').val('').focus();
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