
Ext.onReady(function () {
    
    var fillProdList = function (selected, kntrl) {
        var dt = [];
        $.getJSON('/Product/getProductCodesUsingParentCategory', { parentId: Ext.getCmp('pCat').getValue() }, function (rsp) {
            if (rsp.status.toString() == "true") {
                $.each(rsp.msg, function (i, d) {
                    dt[i] = [d.Id, d.productCode, d.productCodeValue];
                });
                //console.log(dt);
                kntrl.getStore().loadData(dt);
            }
        });
    }

    var editor = new Ext.ux.grid.RowEditor();
   
    var BIGDATA = [];
    var RECEIVE_INVALID;

    var computeSum = function (arr) {
        var tot = 0;
        $.each(arr, function (i, d) {
            tot += parseFloat(d);
        });

        return tot.toFixed(2);
    }

    var generateREQNo = function (ktrl) {
        $.getJSON('/Helper/generateOrderNumber', { TTYPE: 'REQ' }, function (rsp) {
            if (rsp.status.toString() == "true") {
                ktrl.setValue(rsp.msg.toString());
            }
        });
    }

    var getIP = function () {
        $.getJSON('//freegeoip.net/json/?callback=?', function (data) {
            console.log(JSON.stringify(data, null, 2));
        });
    }

    var getActiveLPOs = function (ktrl) {
        ktrl.getStore().removeAll();
        $.getJSON('/Helper/getActiveProcurements', { pstatusId: 1 }, function (rsp) {
            var p = [];
            if (rsp.status.toString() == "true") {
                $.each(rsp.msg, function (i, d) {
                    console.log(d.Proc_Id.Id.toString());
                    //if (d.Proc_Id.Id.toString() == "0") {
                    p[i] = [d.Id, d.ProcurementCode, d.ProcurementName];
                    //}
                });

                console.log(p);
                ktrl.getStore().loadData(p);
            }
        }, "json");
    }

    
    var btn = Ext.get('prod_mgmt');

    btn.on('click', function () {
        var prodWin = Ext.getCmp('prodMgmtWin');
        if (!prodWin) {
        prodWin = new Ext.Window({
                id: 'prodMgmtWin',
                title: 'PRODUCT MANAGEMENT',
                height: 750,
                width: 1200,
                collapsible: false,
                resizable: false,
                closable: true,
                defaults: { xtype: 'tabpanel', tabPosition: 'bottom', enableScroll: true, frame: true, height: 710 },
                items: [
                    {
                        activeTab: 0,
                        items: [
                            {
                                title: 'INVENTORY REQUEST', defaults: { xtype: 'panel', frame: true, border: true }, layout: 'column',
                                items: [
                                    {
                                        columnWidth: .5, defaults: { xtype: 'form', frame: true, border: true },
                                        items: [
                                            {
                                                id: 'frmProc', title: 'Stock Procurement', defaults: { xtype: 'textfield', anchor: '90%', allowBlank: false },
                                                items: [
                                                    { id: 'fno', fieldLabel: 'File No' },
                                                    { id: 'fname', fieldLabel: 'Proc Name' }
                                                ],
                                                listeners: {
                                                    'afterrender': function () {
                                                        generateREQNo(Ext.getCmp('fno'));
                                                    }
                                                }
                                            },
                                            {
                                                id: 'prcStk', title: 'select stock', defaults: { xtype: 'combo', mode: 'local', anchor: '90%' },
                                                items: [
                                                    {
                                                        id: 'pCat', fieldLabel: 'Parent Category',
                                                        store: new Ext.data.Store({
                                                            autoLoad: true, restful: false,
                                                            url: '/Product/getCategoryList', root: 'msg',
                                                            reader: new Ext.data.JsonReader({ type: 'json', root: 'msg' }, [
                                                                { name: 'Id', type: 'int' },
                                                                { name: 'categoryValue', type: 'string' }
                                                            ])
                                                        }), valueField: 'Id', displayField: 'categoryValue', forceSelection: true, typeAhead: true, allowBlank: false,
                                                        listeners: {
                                                            'select': function () {
                                                                Ext.getCmp('grdPrdLst').getStore().removeAll();
                                                                fillProdList(Ext.getCmp('pCat').getValue(), Ext.getCmp('grdPrdLst'));
                                                            }
                                                        }
                                                    }
                                                ]
                                            },
                                            {
                                                id: 'prdLstFrm', title: 'Prod List',
                                                items: [
                                                    new Ext.grid.GridPanel({
                                                        id: 'grdPrdLst', title: '', height: 300, autoScroll: true, autoExpandColumn: 'productCodeValue',
                                                        plugins: [editor],
                                                        //view: new Ext.grid.GroupingView({ markDirty: false }),
                                                        store: new Ext.data.GroupingStore({
                                                            reader: new Ext.data.ArrayReader({}, [
                                                                { name: 'Id', type: 'int' },
                                                                { name: 'productCode', type: 'string' },
                                                                { name: 'productCodeValue', type: 'string' },
                                                                { name: 'qty', type: 'int' },
                                                                { name: 'mktprice', type: 'string' },
                                                                { name: 'prvprice', type: 'string'},
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
                                                             { id: 'productCode', header: 'CODE', width: 70, hidden: false, sortable: true, dataIndex: 'productCode' },
                                                             { id: 'productCodeValue', header: 'PRODUCT', width: 300, hidden: false, sortable: true, dataIndex: 'productCodeValue' },
                                                             {
                                                                 id: 'qty', header: 'QTY REQ', width: 80, hidden: false, sortable: true, dataIndex: 'qty',
                                                                 editor: { xtype: 'numberfield', allowBlank: true,allowNegative: false, minValue: 0, maxValue: 1000 }
                                                             },
                                                             {
                                                                 id: '', header: 'MKT PRICE', width: 80, hidden: false, sortable: true, dataIndex: 'mktprice',
                                                                 editor: { xtype: 'numberfield', allowBlank: true, allowNegative: false, minValue: 0, maxValue: 100000}
                                                             },
                                                             {
                                                                 id: '', header: 'PREV PRICE', width: 80, hidden: false, sortable: true, dataIndex: 'prvprice',
                                                                 editor: { xtype: 'numberfield', allowBlank: true, allowNegative: false, minValue: 0, maxValue: 100000 }
                                                             },
                                                             {
                                                                 xtype: 'numbercolumn',id: 'price', header: 'NEGOTIATED', width: 70, hidden: false, sortable: true, dataIndex: 'price',
                                                                 editor: {
                                                                     xtype: 'numberfield',
                                                                     allowBlank: true,
                                                                     allowNegative: false,
                                                                     minValue: 0,
                                                                     maxValue: 100000
                                                                 }
                                                             }
                                                        ], stripeRows: true, style: {'font-size': '22px'}
                                                    })
                                                ],
                                                buttons: [
                                                    {
                                                        id: 'procBtnAdd', text: 'Add Stock',
                                                        listeners: {
                                                            'click': function (btn) {
                                                                var procF = Ext.getCmp('frmProc').getForm();
                                                                var stkF = Ext.getCmp('prcStk').getForm();
                                                                var prdF = Ext.getCmp('prdLstFrm').getForm();

                                                                if (procF.isValid() && stkF.isValid() && prdF.isValid()) {
                                                                    BIGDATA.length = 0;
                                                                    var stage = [];
                                                                    var a = [];
                                                                    var summer = [];
                                                                    var e = Ext.getCmp('grdPrdLst').getStore().getRange();
                                                                    var count = Ext.getCmp('grdPList').getStore().getCount();

                                                                    if (count > 0) {
                                                                        $.each(Ext.getCmp('grdPList').getStore().getRange(), function (i, d) {
                                                                            stage[i] = [d.get('Id'), d.get('productCode'), (d.get('productCodeValue') + ' @ Ghc' + d.get('price')), d.get('qty'), d.get('price').toFixed(2), parseInt(d.get('qty')) * parseFloat(d.get('price')).toFixed(2),d.get('parentCategory'),d.get('mktprice'), d.get('prvprice')];
                                                                        });
                                                                    }

                                                                    Ext.getCmp('grdPList').getStore().removeAll();

                                                                    var knt = 0;
                                                                    Ext.each(e, function (item, idx) {
                                                                        if (parseInt(item.get('qty')) > 0 && parseFloat(item.get('price'))> 0) {
                                                                            a[knt] = [item.get('Id'), item.get('productCode'), (item.get('productCodeValue') + ' @ Ghc' + item.get('price')), item.get('qty'), item.get('price').toFixed(2), parseInt(item.get('qty')) * parseFloat(item.get('price')).toFixed(2),Ext.fly('pCat').getValue(),item.get('mktprice'),item.get('prvprice')];
                                                                            knt++;
                                                                        }
                                                                    });

                                                                    for (var i = 0; i < stage.length; i++) {
                                                                        BIGDATA.push(stage[i]);
                                                                    }

                                                                    for (var z = 0; z < a.length; z++) {
                                                                        BIGDATA.push(a[z]);
                                                                    }

                                                                    $.each(BIGDATA, function (i, d) {
                                                                        console.log(d[5]);
                                                                        summer[i] = [parseFloat(d[5])];
                                                                    });
                                                                    
                                                                    $('#tCntrlAmt').val(computeSum(summer));
                                                                    Ext.getCmp('grdPList').getStore().loadData(BIGDATA); 
                                                                    $('#procBtnClr').trigger('click');
                                                                }

                                                                
                                                                
                                                            }
                                                        }
                                                    }, {
                                                        id: 'procBtnClr', text: 'Clear Stock',
                                                        listeners: {
                                                            'click': function (btn) {
                                                                Ext.getCmp('prcStk').getForm().reset();
                                                                Ext.getCmp('prdLstFrm').getForm().reset();
                                                                Ext.getCmp('grdPrdLst').getStore().removeAll();
                                                                Ext.getCmp('prcSup').getForm().reset();

                                                                $('#pCat').focus();
                                                            }
                                                        }
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        title: 'Stock List', columnWidth: .5, defaults: { xtype: 'form', frame: true, border: true },
                                        items: [
                                            {
                                                id: '',
                                                items: [
                                                    new Ext.grid.GridPanel({
                                                        id: 'grdPList', title: '', height: 300, autoScroll: true,
                                                        store: new Ext.data.GroupingStore({
                                                            reader: new Ext.data.ArrayReader({}, [
                                                                { name: 'Id', type: 'int' },
                                                                { name: 'productCode',type: 'string'},
                                                                { name: 'productCodeValue', type: 'string' },
                                                                { name: 'qty', type: 'string' },
                                                                { name: 'price', type: 'float'},
                                                                { name: 'QtyByPrice', type: 'string' },
                                                                { name: 'parentCategory', type: 'string' },
                                                                { name: 'mktprice', type: 'string' },
                                                                { name: 'prvprice', type: 'string' }
                                                            ]),
                                                            sortInfo: {
                                                                field: "Id",
                                                                direction: "ASC"
                                                            },
                                                            groupField: "Id"
                                                        }),
                                                        columns: [
                                                             { id: 'Id', header: 'ID', width: 25, hidden: true, sortable: true, dataIndex: 'Id' },
                                                             { id: 'productCode', header: 'PRODUCTCODE', width: 250, hidden: false, sortable: true, dataIndex: 'productCode' },
                                                             { id: 'productCodeValue', header: 'NARRATION', width: 250, hidden: false, sortable: true, dataIndex: 'productCodeValue' },
                                                             { id: 'qty', header: 'QTY', width: 60, hidden: false, sortable: true, dataIndex: 'qty' },
                                                             { id: 'price', header: 'PRICE', width: 60, hidden: false, sortable: true, dataIndex: 'price' },
                                                             { id: 'QtyByPrice', header: 'TOTAL SUM', width: 200, hidden: false, sortable: true, dataIndex: 'QtyByPrice' },
                                                             { id: 'parentCategory', header: 'TOTAL SUM', width: 200, hidden: true, sortable: true, dataIndex: 'parentCategory' },
                                                             { id: 'mktprice', header: 'MKT PRICE', width: 200, hidden: true, sortable: true, dataIndex: 'mktprice' },
                                                             { id: 'prvprice', header: 'PRV PRICE', width: 200, hidden: true, sortable: true, dataIndex: 'prvprice' }
                                                        ], stripeRows: true
                                                    })
                                                ]
                                            },
                                            {
                                                id:'cntrlFrm',title: 'control Amount', defaults: { xtype: 'textfield', allowBlank: false, anchor: '90%' },
                                                items: [
                                                    { id: 'tCntrlAmt', fieldLabel: 'Total Amount', xtype: 'numberfield', style: {'font-size': '16px', 'color': 'red'} }
                                                ]
                                            },
                                            {
                                                id: 'prcSup', title: 'Supplier', defaults: { xtype: 'combo', anchor: '90%', mode: 'local' },
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
                                                    },
                                                    { xtype: 'datefield', id: 'dteRq', fieldLabel: 'Date Requested', allowBlank: false }
                                                ]
                                            },
                                            {
                                                title: 'Actions', 
                                                items: [],
                                                buttons: [
                                                    {
                                                        id: '', text: 'Save Stock Details',
                                                        listeners: {
                                                            'click': function (btn) {
                                                                var controlFrm = Ext.getCmp('cntrlFrm').getForm();
                                                                var supFrm = Ext.getCmp('prcSup').getForm();

                                                                if (controlFrm.isValid() && supFrm.isValid()) {
                                                                    $.ajax({
                                                                        dataType: 'json',
                                                                        url: '/Product/getProcurementData',
                                                                        contentType: 'application/json;charset=utf-8',
                                                                        traditional: true,
                                                                        data: {
                                                                            fno: Ext.fly('fno').getValue(), fname: Ext.fly('fname').getValue(), dteReq: Ext.fly('dteRq').getValue(),
                                                                            sup: Ext.fly('cboPrcSup').getValue(), dta: BIGDATA
                                                                        },
                                                                        success: function (response) {
                                                                            Ext.Msg.alert('STOCK REQUEST STATUS', response.msg.toString(), this);
                                                                        },
                                                                        error: function (response) {
                                                                            Ext.Msg.alert('STOCK REQUEST ERROR', response.msg.toString(), this);
                                                                        }
                                                                    });
                                                                }
                                                            }
                                                        }
                                                    },
                                                    { id: '', text: 'Generate LPO' },
                                                    {
                                                        id: 'procBtnClearForm', text: 'Clear Form',
                                                        listeners: {
                                                            'click': function (btn) {
                                                                $('#procBtnClr').trigger('click');
                                                                Ext.getCmp('frmProc').getForm().reset();
                                                                Ext.getCmp('prcStk').getForm().reset();
                                                                Ext.getCmp('prcSup').getForm().reset();

                                                                Ext.getCmp('grdPList').getStore().removeAll();
                                                                
                                                                generateREQNo(Ext.getCmp('fno'));
                                                                $('#fname').val('').focus();
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
                                title: 'INVENTORY RECEIVED', defaults: { xtype: 'panel', frame: true, border: true, height: 675 }, layout: 'column',
                                items: [
                                    {
                                        title: '', columnWidth: .3, defaults: { xtype: 'form', frame: true, border: true },
                                        items: [
                                            {
                                                id: '',
                                                items: [
                                                    //grid comes here
                                                    new Ext.grid.GridPanel({
                                                        id: 'grdProcList', title: 'Requested LPOs:double-click to select', height: 650, autoScroll: true,
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
                                                                getActiveLPOs(Ext.getCmp('grdProcList'));
                                                            },
                                                            'rowdblclick': function (e, t) {
                                                                Ext.getCmp('grdProcDetailsr').getStore().removeAll();

                                                                var rec = e.getStore().getAt(t);
                                                                $('#lpcoder').val(rec.get('ProcurementCode'));
                                                                $('#lpdesr').val(rec.get('ProcurementName'));

                                                                $.getJSON('/Product/getLPOItems', { id: rec.get('Id'), procCode: rec.get('ProcurementCode') }, function (d) {
                                                                    var po = [];
                                                                    if (d.status.toString() == "true") {
                                                                        $.each(d.msg, function (i, dd) {
                                                                            po[i] = [dd.Id, dd.product_name, dd.categoryLookup_code.categoryLookup, dd.qty_req, dd.dteR, dd.negotiated_unit_price, dd.supplier_Id.sup_name];
                                                                        });
                                                                        Ext.getCmp('grdProcDetailsr').getStore().loadData(po);
                                                                        $('#lpcoder').attr('readonly', true);
                                                                        $('#lpdesr').attr('readonly', true);
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
                                        title: '', columnWidth: .7, defaults: { xtype: 'form', frame: true, border: true }, layout: 'form',
                                        items: [
                                            {
                                                id: 'frmStkDetails', title: 'LPO file', defaults: { xtype: 'textfield', allowBlank: false, anchor: '90%' },
                                                items: [
                                                    { id: 'lpcoder', fieldLabel: 'Code' },
                                                    { id: 'lpdesr', fieldLabel: 'Description' },
                                                    { xtype: 'datefield', id: 'lpdter', fieldLabel: 'Date Supplied', format: 'm/d/Y'},
                                                    { id: '', fieldLabel: 'Log file' }
                                                ]
                                            },
                                            {
                                                id: '', title: 'LPO Items',
                                                items: [
                                                    new Ext.grid.GridPanel({
                                                        id: 'grdProcDetailsr', title: 'Active LPOs details', height: 400, autoScroll: true,
                                                        plugins: [editor],
                                                        store: new Ext.data.GroupingStore({
                                                            reader: new Ext.data.ArrayReader({}, [
                                                                { name: 'Id', type: 'int' },
                                                                { name: 'product_name', type: 'string' },
                                                                { name: 'categoryLookup', type: 'string' },
                                                                { name: 'qty_req', type: 'string' },
                                                                { name: 'dteR', type: 'string' },
                                                                { name: 'negotiated_unit_price', type: 'int' },
                                                                { name: 'sup_name', type: 'string' },
                                                                { name: 'qty_sup', type: 'string' }
                                                            ]),
                                                            sortInfo: {
                                                                field: "Id",
                                                                direction: "ASC"
                                                            },
                                                            groupField: "Id"
                                                        }),
                                                        columns: [
                                                             { id: 'Id', header: 'ID', width: 25, hidden: false, sortable: true, dataIndex: 'Id' },
                                                             { id: 'product_name', header: 'NARRATION', width: 200, hidden: false, sortable: true, dataIndex: 'product_name' },
                                                             { id: 'categoryLookup', header: 'CATEGORY', width: 160, hidden: false, sortable: true, dataIndex: 'categoryLookup' },
                                                             { id: 'qty_req', header: 'QTY REQUESTED', width: 160, hidden: false, sortable: true, dataIndex: 'qty_req' },
                                                             { id: 'dteR', header: 'DATE REQUESTED', width: 160, hidden: false, sortable: true, dataIndex: 'dteR' },
                                                             { id: 'negotiated_unit_price', header: 'UNIT PRICE', width: 160, hidden: false, sortable: true, dataIndex: 'negotiated_unit_price' },
                                                             { id: 'sup_name', header: 'SUPPLIER', width: 160, hidden: false, sortable: true, dataIndex: 'sup_name' },
                                                             { id: 'qty_sup', header: 'QTY SUPPLIED', width: 160, hidden: false, sortable: true, dataIndex: 'qty_sup', editor: { xtype: 'numberfield', allowBlank: false, allowNegative: false, minValue: 0, maxValue: 100000 } }
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
                                                        id: '', text: 'Receive',
                                                        listeners: {
                                                            'click': function (btn) {
                                                                RECEIVE_INVALID = 0;
                                                                var myDta = [];

                                                                var e = Ext.getCmp('grdProcDetailsr').getStore().getRange();
                                                                $.each(e, function (i, d) {
                                                                    if (d.data.qty_sup.toString() == "" || parseInt(d.data.qty_sup) < 1) {
                                                                        console.log(d.data.qty_sup.toString());
                                                                        RECEIVE_INVALID = 1;
                                                                        return false;
                                                                    }
                                                                    else {
                                                                        myDta[i] = [d.data.Id, d.data.qty_sup];
                                                                        RECEIVE_INVALID = 0;
                                                                    }
                                                                });

                                                                //receive LPOs in the system
                                                                if (RECEIVE_INVALID == 0) {

                                                                    $.ajax({
                                                                        dataType: 'json',
                                                                        url: '/Product/receiveLPO',
                                                                        contentType: 'application/json;charset=utf-8',
                                                                        traditional: true,
                                                                        data: {
                                                                            procCode: Ext.fly('lpcoder').getValue(), statusId: 2, dte: Ext.fly('lpdter').getValue(), dta: myDta
                                                                        },
                                                                        success: function (response) {
                                                                            Ext.Msg.alert('RECEIVING INVENTORY REQUEST STATUS', 'Inventory Items received successfully, awaiting execution from Stores Department', this);
                                                                        },
                                                                        error: function (response) {
                                                                            Ext.Msg.alert('STOCK REQUEST ERROR', response.msg.toString(), this);
                                                                        }
                                                                    });

                                                                    
                                                                }
                                                                else {
                                                                    Ext.Msg.alert('RECEIVING INVENTORY REQUEST STATUS', 'Please enter quantity supplied for all items to receive LPO', this);
                                                                }
                                                            }
                                                        }
                                                    },
                                                    { id: '', text: 'Reject' },
                                                    {
                                                        id: 'btn_clear', text: 'Clear',
                                                        listeners: {
                                                            'click': function (btn) {
                                                                Ext.getCmp('frmStkDetails').getForm().reset();
                                                                Ext.getCmp('grdProcDetailsr').getStore().removeAll();
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