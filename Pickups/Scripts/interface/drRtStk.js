Ext.onReady(function () {
    var editor = new Ext.ux.grid.RowEditor();
    var returnedEditor = new Ext.ux.grid.RowEditor();
    
    //var returnedS = [];

    var getBranchStock = function (k, cId) {
        var dta = [];
        $.getJSON('/Helper/getBusinessUnitStockFile', { catId: cId }, function (r) {
        //$.getJSON('/Helper/getBusinessUnitStockFileUsingProductCategory', { catId: cId }, function (r) {
            $.each(r.msg, function (i, d) {
                dta[i] = [d.objProduct.Id, d.objProduct.product_name, d.currentStockQuantity, d.thresholdCeiling, d.thresholdBase];
            });
            k.getStore().loadData(dta);
        });

    }
    var effectDrawDown = function (arr, nom, des, ddte) {
        $.ajax({
            dataType: 'json',
            url: '/Product/drawDownStock',
            contentType: 'application/json;charset=utf-8',
            traditional: true,
            data: {
                items: arr, oNo: nom, oDes: des, dte: ddte
            },
            success: function (data, status, xhttp) {
                Ext.Msg.alert('DRAWDOWN STATUS', data.msg.toString(), this);
                $('#drRtClrStk').trigger('click');
            },
            error: function (data, status, xhttp) {
                Ext.Msg.alert('DRAWDOWN ERROR', data.msg.toString(), this);
            }
        });
    }

    var computeTotalCost = function (k, arr, rnom, rdes, rdte, rcomm) {
        
        $.ajax({
            dataType: 'json',
            url: '/Product/getTotalReturnedCost',
            contentType: 'application/json;charset=utf-8',
            traditional: true,
            data: {
                items: arr, dte: rdte
            },
            success: function (response) {
                k.setValue(parseFloat(response.msg.toString()).toFixed(2));
            },
            error: function (response) {
                Ext.Msg.alert('ORDER REQUEST ERROR', response.msg.toString(), this);
            }
        });
    }

    var getDdnHistory = function (k) {
        var ret = [];
        //k.getStore().removeAll();
        $.getJSON('/Helper/getDrawDownHistory', {}, function (rs) {
            if (rs.status.toString() == "true") {
                $.each(rs.msg, function (i,d) {
                    ret[i] = [d.Id, d.description];
                });

                console.log(ret);
                k.getStore().loadData(ret);
            }
        });
    }

    var effectReturnedStock = function (fno,fdesc,fdte,amt, arr) {
        $.ajax({
            dataType: 'json',
            url: '/Product/returnStock',
            contentType: 'application/json;charset=utf-8',
            traditional: true,
            data: {
                file:fno,desc:fdesc,dte:fdte,ramt: amt,items: arr
            },
            success: function (data, status, xhttp) {
                if (data.status.toString() == "true") {
                    Ext.Msg.alert('RETURNED STOCKS STATUS', data.msg.toString(), this);
                }
            },
            error: function (data, status, xhttp) {
                Ext.Msg.alert('ORDER REQUEST ERROR', response.msg.toString(), this);
            }
        });
    }

    var isNotFound = function (isValue,arr) {
        for (var i = 0; i <= arr.length; i++) {
            if (arr[i][0] == isValue) {
                return i;
            }
        }

        return -1;
    }



    var drddn = Ext.get('drRtStk');
    

    drddn.on('click', function () {
        var drddnwin = Ext.getCmp('drddnWindow');

        if (!drddnwin) {
            drddnwin = new Ext.Window({
                id: 'drddnWindow',
                height: 700,
                width: 1100,
                collapsible: false,
                resizable: false,
                closable: true,
                title: 'BRANCH DRAW DOWN FORM',
                defaults: { xtype: 'tabpanel', tabPosition: 'bottom', enableScroll: true, frame: true, height: 670 },
                items: [
                    {
                        activeTab: 0,
                        items: [
                            {
                                title: 'BRANCH/DEPARTMENT DRAW DOWN', defaults: { xtype: 'panel', frame: true, border: true, height: 640 }, layout: 'column',
                                items: [
                                    {
                                        columnWidth: .5, defaults: { xtype: 'form', frame: true, border: true },
                                        items: [
                                            {
                                                id: 'drawdownFrm', title: 'DrawDown file', defaults: { xtype: 'textfield', allowBlank: false, anchor: '90%' },
                                                items: [
                                                    { id: 'dfno', fieldLabel: 'File No' },
                                                    { id: 'dfname', fieldLabel: 'File Description' },
                                                    { xtype: 'datefield', id: 'dfdte', fieldLabel: 'Date', format: 'd/m/Y', anchor: '45%' }
                                                ],
                                                listeners: {
                                                    'render': function () {
                                                        $.getJSON('/Helper/generateOrderNumber', { TTYPE: 'DRWDN' }, function (r) {
                                                            $('#dfno').val(r.msg.toString()).attr('readonly', 'readonly');
                                                            $('#dfname').val('DRAWDOWN');
                                                        });
                                                    }
                                                }
                                            },
                                            {
                                                title: 'Category', id: 'drawdownCatfrm', defaults: { xtype: 'combo', mode: 'local', typeAhead: true, forceSelection: true, anchor: '90%' },hidden: true,
                                                items: [
                                                    {
                                                        id: 'cboCat', fieldLabel: 'Category',
                                                        store: new Ext.data.Store({
                                                            autoLoad: true, restful: false,
                                                            url: '/Product/getCategoryList',
                                                            reader: new Ext.data.JsonReader({ root: 'msg' }, [
                                                                { name: 'Id', type: 'int' },
                                                                { name: 'categoryValue', type: 'string' }
                                                            ])
                                                        }), valueField: 'Id', displayField: 'categoryValue',
                                                        listeners: {
                                                            'select': function () {
                                                                Ext.getCmp('grdStkUsage').getStore().removeAll();
                                                                getBranchStock(Ext.getCmp('grdStkUsage'), Ext.getCmp('cboCat').getValue());
                                                            }
                                                        }
                                                    }
                                                ]
                                            },
                                            {
                                                id: '', title: 'Stock Usage',
                                                items: [
                                                    new Ext.grid.GridPanel({
                                                        id: 'grdStkUsage', title: '', height: 300, autoScroll: true,autoExpandColumn: 'product_name',
                                                        plugins: [editor],
                                                        store: new Ext.data.GroupingStore({
                                                            reader: new Ext.data.ArrayReader({}, [
                                                                { name: 'Id', type: 'int' },
                                                                { name: 'product_name', type: 'string' },
                                                                { name: 'CurrentStockLevel', type: 'string' },
                                                                { name: 'Ceiling', type: 'string' },
                                                                { name: 'Floor', type: 'string' },
                                                                { name: 'QtyTaken', type: 'int' }
                                                            ]),
                                                            sortInfo: {
                                                                field: "product_name",
                                                                direction: "ASC"
                                                            },
                                                            groupField: "product_name"
                                                        }),
                                                        columns: [
                                                             { id: 'Id', header: 'ID', width: 25, hidden: true, sortable: true, dataIndex: 'Id' },
                                                             { id: 'product_name', header: 'PRODUCT', width: 200, hidden: false, sortable: true, dataIndex: 'product_name' },
                                                             { id: 'CurrentStockLevel', header: 'STOCK', width: 160, hidden: false, sortable: true, dataIndex: 'CurrentStockLevel' },
                                                             { id: 'Ceiling', header: 'LIMIT', width: 160, hidden: true, sortable: true, dataIndex: 'Ceiling' },
                                                             { id: 'Floor', header: 'BASE', width: 160, hidden: true, sortable: true, dataIndex: 'Floor' },
                                                             {
                                                                 id: 'QtyTaken', header: 'QTY BEING TAKEN', width: 160, hidden: false, sortable: true, dataIndex: 'QtyTaken', editor: {
                                                                     xtype: 'numberfield', minValue: 1, maxValue: 1000, allowBlank: false, allowNegative: false
                                                                 }
                                                             },
                                                        ], stripeRows: true,
                                                        listeners: {
                                                            'render': function () {
                                                                getBranchStock(Ext.getCmp('grdStkUsage'), 0);
                                                            },
                                                            'afterrender': function () {
                                                                setInterval(function () {
                                                                    getBranchStock(Ext.getCmp('grdStkUsage'), 0);
                                                                }, 90000);
                                                            }
                                                        },
                                                        viewConfig: {
                                                            getRowClass: function (record, rowIndex, rowParams, store) {
                                                                return ((rowIndex % 2) == 0) ? "even-class" : "odd-class";
                                                            }
                                                        }
                                                    })
                                                ],
                                                buttons: [
                                                    {
                                                        id: '', text: 'Add',
                                                        listeners: {
                                                            'click': function () {
                                                                var txfrm = Ext.getCmp('drawdownFrm').getForm();
                                                                var tyfrm = Ext.getCmp('drawdownCatfrm').getForm();
                                                                var arr = [];
                                                                var iLeft = 0;
                                                                
                                                                var k = 0;
                                                                if (txfrm.isValid())
                                                                {
                                                                    arr.length = 0;
                                                                    //Ext.getCmp('grdStkSummary').getStore().removeAll();

                                                                    Ext.each(Ext.getCmp('grdStkUsage').getStore().getRange(), function (item, idx) {
                                                                        if (parseInt(item.data.QtyTaken.toString()) > parseInt(item.data.CurrentStockLevel.toString())) {
                                                                            Ext.Msg.alert('ERROR', 'Quantity drawn down for ' + item.data.product_name.toString() + ' cannot be more than quantity in stock', this);
                                                                            arr.length = 0;
                                                                            Ext.getCmp('grdStkSummary').getStore().removeAll();
                                                                            return false;
                                                                        }

                                                                        if (parseInt(item.data.QtyTaken) > 0) {
                                                                            //check if product has already been added
                                                                            iLeft = parseInt(item.data.CurrentStockLevel) - parseInt(item.data.QtyTaken);
                                                                            arr[idx] = [item.data.Id, item.data.product_name, item.data.QtyTaken, iLeft];
                                                                        }
                                                                    });
                                                                    arr = arr.filter(function (val) { return val !== undefined; });
                                                                    console.log(arr);
                                                                    Ext.getCmp('grdStkSummary').getStore().loadData(arr);
                                                                }
                                                            }
                                                        }
                                                    },
                                                    {
                                                        tpl: new Ext.XTemplate('<a id="aRetList" style="display:none" href="{path}">Stock Control List</a>'), compiled: !0, data: {
                                                            path: "/Notification/StockControlList"
                                                        }
                                                    },
                                                    {
                                                        id: '', text: 'Print Excel',
                                                        listeners: {
                                                            'click': function (btn) {
                                                                if (Ext.getCmp('grdStkUsage').getStore().getCount() > 0) {
                                                                    window.open(document.getElementById('aRetList').href, "_blank");
                                                                }
                                                            }
                                                        }
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        columnWidth: .5, defaults: { xtype: 'form', frame: true, border: true}, layout: 'accordion',
                                        items: [
                                            new Ext.grid.GridPanel({
                                                id: 'grdStkSummary', title: 'Drawdown List', autoScroll: true,
                                                store: new Ext.data.GroupingStore({
                                                    reader: new Ext.data.ArrayReader({}, [
                                                        { name: 'Id', type: 'int' },
                                                        { name: 'product', type: 'string' },
                                                        { name: 'qntyTaken', type: 'string' },
                                                        { name: 'outstanding', type: 'string' }
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
                                                     { id: 'qntyTaken', header: 'STOCK', width: 160, hidden: false, sortable: true, dataIndex: 'qntyTaken' },
                                                     { id: 'outstanding', header: 'LIMIT', width: 160, hidden: true, sortable: true, dataIndex: 'outstanding' }
                                                ], stripeRows: true,
                                                viewConfig: {
                                                    getRowClass: function (record, rowIndex, rowParams, store) {
                                                        return ((rowIndex % 2) == 0) ? "even-class" : "odd-class";
                                                    }
                                                }
                                            }),
                                            {
                                                id: '', title: 'DrawDown History',
                                                items: [
                                                    new Ext.grid.GridPanel({
                                                        id: 'grdDdnHistory', autoScroll: true, autoExpandColumn: 'description', height: 500,
                                                        store: new Ext.data.GroupingStore({
                                                            reader: new Ext.data.ArrayReader({}, [
                                                                { name: 'Id', type: 'int' },
                                                                { name: 'description', type: 'string' }
                                                            ]),
                                                            sortInfo: {
                                                                field: "Id",
                                                                direction: "ASC"
                                                            },
                                                            groupField: "Id"
                                                        }),
                                                        columns: [
                                                             { id: 'Id', header: 'ID', width: 25, hidden: true, sortable: true, dataIndex: 'Id' },
                                                             { id: 'description', header: '', width: 200, hidden: false, sortable: true, dataIndex: 'description' }
                                                        ], stripeRows: true,
                                                        viewConfig: {
                                                            getRowClass: function (record, rowIndex, rowParams, store) {
                                                                return ((rowIndex % 2) == 0) ? "even-class" : "odd-class";
                                                            }
                                                        },
                                                        listeners: {
                                                            'render': function () {
                                                                getDdnHistory(Ext.getCmp('grdDdnHistory'));
                                                            },
                                                            'afterrender': function () {
                                                                setInterval(function () {
                                                                    getDdnHistory(Ext.getCmp('grdDdnHistory'));
                                                                }, 30000);
                                                            }
                                                        }
                                                    })
                                                ],
                                                buttons: [
                                                    {
                                                        tpl: new Ext.XTemplate('<a id="aDrDdn" style="display:none" href="{path}">DrawDown Report (xlsx)</a>'), compiled: !0, data: {
                                                            path: "/Notification/DrawDownReport"
                                                        }
                                                                , autoScroll: !0
                                                    },
                                                    {
                                                        id: 'ddnRepBtn', text: 'Generate CSv File',
                                                        listeners: {
                                                            'click': function (btn) {
                                                                if (Ext.getCmp('grdDdnHistory').getStore().getCount() > 0) {
                                                                    window.open(document.getElementById("aDrDdn").href, "_blank");
                                                                }
                                                            }
                                                        }
                                                    }
                                                ]
                                            }
                                        ],
                                        buttons: [
                                            {
                                                id: 'drRtStkSvBtn', text: 'Save',
                                                listeners: {
                                                    'click': function (btn) {
                                                        var saveArray = [];
                                                        if (Ext.getCmp('grdStkSummary').getStore().getCount() > 0) {
                                                            var eex = Ext.getCmp('grdStkSummary').getStore().getRange();

                                                            Ext.each(eex, function (item, idx) {
                                                                saveArray[idx] = [item.data.Id, item.data.product, item.data.qntyTaken, item.data.outstanding];
                                                            });
                                                        }

                                                        effectDrawDown(saveArray, $('#dfno').val(), $('#dfname').val(), $('#dfdte').val());
                                                        $('#drRtStkClrBtn').trigger('click');
                                                    }
                                                }
                                            },
                                            {
                                                id: 'drRtStkClrBtn', text: 'Clear',
                                                listeners: {
                                                    'click': function (btn) {
                                                        Ext.getCmp('drawdownFrm').getForm().reset();
                                                        Ext.getCmp('drawdownCatfrm').getForm().reset();
                                                        Ext.getCmp('grdStkUsage').getStore().removeAll();
                                                        Ext.getCmp('grdStkSummary').getStore().removeAll();
                                                        $.getJSON('/Helper/generateOrderNumber', { TTYPE: 'DRWDN' }, function (r) {
                                                            $('#dfno').val(r.msg.toString()).attr('readonly', 'readonly');
                                                            $('#dfname').val('DRAWDOWN');
                                                        });
                                                    }
                                                }
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                title: 'RETURN STOCK', defaults: { xtype: 'panel', frame: true, border: true, height: 670 }, layout: 'column',
                                items: [
                                    {
                                        id: '', columnWidth: .5, defaults: { xtype: 'form', frame: true, border: true },
                                        items: [
                                            {
                                                id: 'frmReturnFile', title: 'Return file', defaults: { xtype: 'textfield', allowBlank: false, anchor: '90%' },
                                                items: [
                                                    { id: 'retNo', fieldLabel: 'File No' },
                                                    { id: 'retName', fieldLabel: 'Description' },
                                                    { xtype: 'datefield', id: 'retdte', format: 'd/m/Y', fieldLabel: 'Date', anchor: '45%' }
                                                ],
                                                listeners: {
                                                    'render': function () {
                                                        $.getJSON('/Helper/generateOrderNumber', { TTYPE: 'RTN' }, function (r) {
                                                            $('#retNo').val(r.msg.toString()).attr('readonly', 'readonly');
                                                            $('#retName').val('RETURNED');
                                                        });
                                                    }
                                                }
                                            },
                                            {
                                                id: 'frmReturnedCat', title: 'Category', defaults: { xtype: 'combo', forceSelection: true, typeAhead: true, mode: 'local' },hidden: true,
                                                items: [
                                                    {
                                                        id: 'cboReturnedCat',fieldLabel: 'Category', anchor: '90%',
                                                        store: new Ext.data.Store({
                                                            autoLoad: true, restful: false,
                                                            url: '/Product/getCategoryList',
                                                            reader: new Ext.data.JsonReader({root: 'msg'}, [
                                                                { name: 'Id', type: 'int' },
                                                                { name: 'categoryValue', type: 'string' }
                                                            ])
                                                        }), valueField: 'Id', displayField: 'categoryValue',
                                                        listeners: {
                                                            'select': function () {
                                                                Ext.getCmp('grdStkReturned').getStore().removeAll();
                                                                getBranchStock(Ext.getCmp('grdStkReturned'), Ext.getCmp('cboReturnedCat').getValue());
                                                            }
                                                        }
                                                    }
                                                ]
                                            },
                                            {
                                                id: 'frmStkReturned', title: 'Return Stock',
                                                items: [
                                                    new Ext.grid.GridPanel({
                                                        id: 'grdStkReturned', title: '', height: 300, autoScroll: true,
                                                        plugins: [returnedEditor],
                                                        store: new Ext.data.GroupingStore({
                                                            reader: new Ext.data.ArrayReader({}, [
                                                                { name: 'Id', type: 'int' },
                                                                { name: 'product_name', type: 'string' },
                                                                { name: 'CurrentStockLevel', type: 'string' },
                                                                { name: 'Ceiling', type: 'string' },
                                                                { name: 'Floor', type: 'string' },
                                                                { name: 'QtyReturned', type: 'int' }
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
                                                             { id: 'CurrentStockLevel', header: 'STOCK', width: 160, hidden: false, sortable: true, dataIndex: 'CurrentStockLevel' },
                                                             { id: 'Ceiling', header: 'LIMIT', width: 160, hidden: true, sortable: true, dataIndex: 'Ceiling' },
                                                             { id: 'Floor', header: 'BASE', width: 160, hidden: true, sortable: true, dataIndex: 'Floor' },
                                                             {
                                                                 id: 'QtyReturned', header: 'QTY BEING RETURNED', width: 160, hidden: false, sortable: true, dataIndex: 'QtyReturned', editor: {
                                                                     xtype: 'numberfield', minValue: 1, maxValue: 1000, allowBlank: false, allowNegative: false
                                                                 }
                                                             },
                                                        ], stripeRows: true,
                                                        listeners: {
                                                            'render': function () {
                                                                getBranchStock(Ext.getCmp('grdStkReturned'), 0);
                                                            },
                                                            'afterrender': function () {
                                                                setInterval(function () {
                                                                    getBranchStock(Ext.getCmp('grdStkReturned'), 0);
                                                                }, 60000);
                                                            }
                                                        },
                                                        viewConfig: {
                                                            getRowClass: function (record, rowIndex, rowParams, store) {
                                                                return ((rowIndex % 2) == 0) ? "even-class" : "odd-class";
                                                            }
                                                        }
                                                    })
                                                ],
                                                buttons: [
                                                    {
                                                        id: '', text: 'Add Returned Stock',
                                                        listeners: {
                                                            'click': function (btn) {
                                                                var rf = Ext.getCmp('frmReturnFile').getForm();
                                                                var rc = Ext.getCmp('frmReturnedCat').getForm();
                                                                var stkR = Ext.getCmp('frmStkReturned').getForm();

                                                                var returnedS = [];
                                                                var outSt = 0;

                                                                if (rf.isValid() && stkR.isValid()) {
                                                                    
                                                                    returnedS.length = 0;
                                                                    Ext.getCmp('grdRetDetails').getStore().removeAll();

                                                                    Ext.each(Ext.getCmp('grdStkReturned').getStore().getRange(), function (d, idx) {
                                                                        if (parseInt(d.data.QtyReturned) > parseInt(d.data.CurrentStockLevel)) {
                                                                            Ext.Msg.alert('RETURNED STOCK', 'User cannot return more stock than current stock level', this);
                                                                            return false;
                                                                        }
                                                                    });

                                                                    if (Ext.getCmp('grdRetDetails').getStore().getCount() < 1) {
                                                                        var idx = 0;
                                                                        Ext.each(Ext.getCmp('grdStkReturned').getStore().getRange(), function (d, i) {
                                                                            if (parseInt(d.data.QtyReturned) > 0) {
                                                                                returnedS[idx] = [d.data.Id, d.data.product_name, d.data.QtyReturned, parseInt(d.data.CurrentStockLevel) - parseInt(d.data.QtyReturned)];
                                                                                idx++;
                                                                            }
                                                                        });

                                                                        Ext.getCmp('grdRetDetails').getStore().loadData(returnedS);
                                                                        computeTotalCost(Ext.getCmp('drTotAmt'), returnedS, $('#retno').val(), $('#retname').val(), Ext.fly('retdte').getValue(), '');
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        title: '', columnWidth: .5, defaults: { xtype: 'form', frame: true, border: true },
                                        items: [
                                            {
                                                id: 'frmRetDtails',
                                                items: [
                                                    new Ext.grid.GridPanel({
                                                        id: 'grdRetDetails', title: 'Returned List', height: 300, autoScroll: true,
                                                        store: new Ext.data.GroupingStore({
                                                            reader: new Ext.data.ArrayReader({}, [
                                                                { name: 'Id', type: 'int' },
                                                                { name: 'product', type: 'string' },
                                                                { name: 'returnedQty', type: 'string' },
                                                                { name: 'outstanding', type: 'string' }
                                                            ]),
                                                            sortInfo: {
                                                                field: "Id",
                                                                direction: "ASC"
                                                            },
                                                            groupField: "Id"
                                                        }),
                                                        columns: [
                                                             { id: 'Id', header: 'ID', width: 25, hidden: false, sortable: true, dataIndex: 'Id' },
                                                             { id: 'product', header: 'PRODUCT', width: 200, hidden: false, sortable: true, dataIndex: 'product' },
                                                             { id: 'returnedQty', header: 'UNITS RETURNED', width: 160, hidden: false, sortable: true, dataIndex: 'returnedQty' },
                                                             { id: 'outstanding', header: 'UNITS LEFT', width: 160, hidden: false, sortable: true, dataIndex: 'outstanding' }
                                                        ], stripeRows: true,
                                                        viewConfig: {
                                                            getRowClass: function (record, rowIndex, rowParams, store) {
                                                                return ((rowIndex % 2) == 0) ? "even-class" : "odd-class";
                                                            }
                                                        }
                                                    })
                                                ]
                                            },
                                            {
                                                id: 'drfrmTotAmt', title: 'Total Amt', defaults: { xtype: 'textfield', anchor: '90%', allowBlank: false },
                                                items: [
                                                    { id: 'drTotAmt', fieldLabel: 'Grand Total', style: {'text-align': 'center', 'font-size': '18px', 'color': 'red'} }
                                                ]
                                            },
                                            {
                                                id: '', title: 'Actions',
                                                items: [],
                                                buttons: [
                                                    {
                                                        id: 'drRtRetStk', text: 'RETURN STOCK',
                                                        listeners: {
                                                            'click': function (btn) {
                                                                var dArr = [];
                                                                if (Ext.getCmp('grdRetDetails').getStore().getCount() > 0) {
                                                                    var ee = Ext.getCmp('grdRetDetails').getStore().getRange();
                                                                    Ext.each(ee, function (dt,i) {
                                                                        dArr[i] = [dt.data.Id, dt.data.returnedQty, dt.data.product, dt.data.outstanding];
                                                                    });

                                                                    effectReturnedStock(Ext.fly('retNo').getValue(), Ext.fly('retName').getValue(), Ext.fly('retdte').getValue(), Ext.fly('drTotAmt').getValue(), dArr);
                                                                    $('#drRtClrStk').trigger('click');
                                                                }
                                                            }
                                                        }
                                                    },
                                                    {
                                                        id: 'drRtClrStk', text: 'CLEAR STOCK',
                                                        listeners: {
                                                            'click': function (btn) {
                                                                Ext.getCmp('grdRetDetails').getStore().removeAll();
                                                                Ext.getCmp('drfrmTotAmt').getForm().reset();
                                                                Ext.getCmp('grdStkReturned').getStore().removeAll();
                                                                Ext.getCmp('frmReturnedCat').getForm().reset();
                                                                Ext.getCmp('frmReturnFile').getForm().reset();

                                                                $.getJSON('/Helper/generateOrderNumber', { TTYPE: 'RTN' }, function (r) {
                                                                    $('#retNo').val(r.msg.toString()).attr('readonly', 'readonly');
                                                                    $('#retName').val('RETURNED');
                                                                });
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
