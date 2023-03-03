//e.preventDefault();
Ext.onReady(function () {
    /* */
    var globalBranch = [];
    var getProductCategoryList = function (k) {
        $.getJSON('/Product/getProductCategoryList', {}, function (rs) {
            if (rs.status.toString() == "true") {
                var a = [];
                $.each(rs.msg,function(i,d){
                    a[i] = [d.Id, d.productCode, d.productCodeValue, d.dte, d.comment, d.parentCategoryLookup.categoryValue];
                });

                k.getStore().loadData(a);
            }
        });
    }
    
    var getBranchList = function (b) {
        var bdta = [];
        globalBranch = [];
        $.getJSON('/Product/getBranchList', {}, function (bs) {
            if (bs.status.toString() == "true") {
                $.each(bs.msg, function (i, d) {
                    bdta[i] = [d.Id, d.branchCode, d.branchName, d.mnemonic, d.objRegion.adminRegion.toString(), d.internalAccount, d.branchNotif];
                    globalBranch[i] = d.branchName;
                });
                b.getStore().loadData(bdta);
            }
        });
    }

    var getSuppliers = function (s) {
        var spa = [];
        $.getJSON('/Supplier/getSupplierList', {}, function (sp) {
            if (sp.status.toString() == "true") {
                $.each(sp.msg, function (i,d) {
                    spa[i] = [d.Id,d.sup_code,d.sup_name,d.contactPerson,d.contactNumber];
                });
                s.getStore().loadData(spa);
            }
        });
    }

    var getCategoryList = function (c) {
        c.getStore().removeAll();
        var cat = [];
        $.getJSON('/Product/getCategoryList', {}, function (dta) {
            if (dta.status.toString() == "true") {
                $.each(dta.msg, function (i,d) {
                    cat[i] = [d.Id, d.categoryLookup, d.categoryValue, d.Account, d.categoryControlAmount, d.AccountName];
                });
                c.getStore().loadData(cat);
            }
        });
    }

    var getStoreAccountList = function (st) {
        var t = [];
        $.getJSON('/Product/getStoreAccounts', {}, function (resp) {
            if (resp.status.toString() == "true") {
                $.each(resp.msg, function (i, d) {
                    t[i] = [d.Id, d.accountNumber, d.accountName, d.accountDomiciledBranch.branchName]
                });
                st.getStore().loadData(t);
            }
        });
    }

    var getProductMeasurement = function (pm) {
        var p = [];
        $.getJSON('/Product/getProductMetrics', {}, function (r) {
            if (r.status.toString() == "true") {
                $.each(r.msg, function (i, d) {
                    p[i] = [d.Id, d.objProduct.productCode, d.objMetric.metric_name, d.thresholdValue.toString(), d.thresholdCeiling.toString(), (d.objProduct.productCode + '-' + d.objProduct.productCodeValue).toString()];
                });
                pm.getStore().loadData(p);
            }
        });
    }

    var getUserNotifiers = function (x) {
        var u = [];
        $.getJSON('/User/getNotifiers', {}, function (rs) {
            if (rs.status.toString() == "true") {
                $.each(rs.msg, function (i,d) {
                    u[i] = [d.Id, d.staffNo, d.surname, d.emailAddress, d.contactNumber, d.objBranch.branchName, d.firstname, d.othernames, d.objCategoryOfNotification.CategoryOfNotification];
                });
                x.getStore().loadData(u);
                console.log(u);
            }
        });
    }

    var BRANCHRKD;
    var PRDCAT;
    var PRDT = '';
    var updateFlag = false;
    var STOR;
    var THRESH;
    var uNOTIF;
    var uNOTIFFLAG = 0;


    
    var pbtn = Ext.get('op_mod');

    pbtn.on('click', function () {
        var pwin = Ext.getCmp('opmodMgmt');
        if (!pwin) {

        pwin = new Ext.Window({
                id: 'opmodMgmt',
                title: 'OPERATIONAL MANAGEMENT',
                height: 700,
                width: 1200,
                collapsible: false,
                resizable: false,
                closable: true,
                defaults: { xtype: 'panel', frame: true, border: true }, layout: 'column',
                items: [
                    {
                        title: 'Operational Setups', height: 660, width: '35%', defaults: { xtype: 'panel', frame: true, border: true }, layout: 'accordion', collapsible: false,
                        items: [
                            {
                                title: 'Branch Setup', height: 300, defaults: { xtype: 'form', frame: true, border: true }, layout: 'form',
                                items: [
                                    {
                                        id: 'frmBrnInfo',title: 'Branch Info', defaults: { xtype: 'textfield', anchor: '90%', allowBlank: false },
                                        items: [
                                            { id: 'bcod', fieldLabel: 'Branch ID' },
                                            { id: 'brn', fieldLabel: 'Branch' },
                                            { id: 'moniker', fieldLabel: 'mnemonic' },
                                            {
                                                xtype: 'combo', fieldLabel: 'Region', mode: 'local', id: 'rg',
                                                store: new Ext.data.Store({
                                                    autoLoad: true, restful: false,
                                                    url: '/Helper/getRegions',
                                                    reader: new Ext.data.JsonReader({}, [
                                                        { name: 'Id', type: 'int' },
                                                        { name: 'adminRegion', type: 'string' }
                                                    ])
                                                }),
                                                valueField: 'Id', displayField: 'adminRegion', allowBlank: true
                                            },
                                            { id: 'intAcct', fieldLabel: 'Internal Accnt' },
                                            { id: 'brEmail', fieldLabel: 'Email'},
                                            { xtype: 'textarea', id: 'bAddr', fieldLabel: 'Address', allowBlank: true }
                                        ],
                                        buttons: [
                                            {
                                                text: 'Save',
                                                id: 'btnSaveBrn',
                                                listeners: {
                                                    'click': function (btn) {
                                                        var f = Ext.getCmp('frmBrnInfo').getForm();
                                                        if (f.isValid()) {
                                                            //update?
                                                            console.log(BRANCHRKD.get('Id').toString());
                                                            if (parseInt(BRANCHRKD.get('Id').toString()) > 0) {
                                                                $.post('/Product/updateBranch',
                                                                {
                                                                    BId: parseInt(BRANCHRKD.get('Id')), bcode: Ext.fly('bcod').getValue(), bname: Ext.fly('brn').getValue(), bAddr: Ext.fly('bAddr').getValue(),
                                                                    moniker: Ext.fly('moniker').getValue(), reg: Ext.fly('rg').getValue(), intAccnt: Ext.fly('intAcct').getValue(),
                                                                    bemail: Ext.fly('brEmail').getValue()
                                                                }, function (rsp) {
                                                                    if (rsp.status.toString() == "true") {
                                                                        Ext.Msg.alert('BRANCH RECORD UPDATE', 'Branch record updated successfully', this);
                                                                        BRANCHRKD = '';
                                                                        getBranchList(Ext.getCmp('gBrnInfo'));
                                                                        $('#btnClrBrn').trigger('click');
                                                                    }
                                                                }, "json");

                                                                return false;
                                                            }
                                                            
                                                            $.post('/Product/addBranch',
                                                                {
                                                                    bcode: Ext.fly('bcod').getValue(), bname: Ext.fly('brn').getValue(), bAddr: Ext.fly('bAddr').getValue(),
                                                                    moniker: Ext.fly('moniker').getValue(), reg: Ext.fly('rg').getValue(), intAccnt: Ext.fly('intAcct').getValue(),
                                                                    bemail: Ext.fly('brEmail').getValue()
                                                                }, function (stat) {
                                                                    if (stat.status.toString() == "true") {
                                                                        getBranchList(Ext.getCmp('gBrnInfo'));
                                                                        $('#btnClrBrn').trigger('click');
                                                                    }
                                                            },"json");
                                                        }
                                                    }
                                                }
                                            }, {
                                                text: 'Clear',
                                                id: 'btnClrBrn',
                                                listeners: {
                                                    'click': function (btn) {
                                                        Ext.getCmp('frmBrnInfo').getForm().reset();
                                                        $('#bcod').focus();
                                                    }
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        title: 'Branch List', id: '',
                                        items: [
                                            new Ext.grid.GridPanel({
                                                id: 'gBrnInfo', title: '', height: 185, autoScroll: true,autoExpandColumn: 'branchCode',
                                                store: new Ext.data.GroupingStore({
                                                    reader: new Ext.data.ArrayReader({}, [
                                                        { name: 'Id', type: 'int'},
                                                        { name: 'branchCode', type: 'string' },
                                                        { name: 'bname', type: 'string' },
                                                        { name: 'mnemonic', type: 'string' },
                                                        { name: 'region', type: 'string' },
                                                        { name: 'internalAccount', type: 'string' },
                                                        { name: 'branchNotif', type: 'string' }
                                                    ]),
                                                    sortInfo: {
                                                        field: "bname",
                                                        direction: "ASC"
                                                    },
                                                    groupField: "bname"
                                                }),
                                                columns: [
                                                    { id: 'Id', header: 'ID', width: 60, hidden: true, sortable: true, dataIndex: 'Id' },
                                                     { id: 'branchCode', header: 'CODE', width: 60, hidden: false, sortable: true, dataIndex: 'branchCode' },
                                                     { id: 'bname', header: 'BRANCH', width: 100, hidden: false, sortable: true, dataIndex: 'bname' },
                                                     { id: 'mnemonic', header: 'MNEMONIC', width: 80, hidden: false, sortable: true, dataIndex: 'mnemonic' },
                                                     { id: 'region', header: 'REGION', width: 200, hidden: false, sortable: true, dataIndex: 'region' },
                                                     { id: 'internalAccount', header: 'REGION', width: 200, hidden: true, sortable: true, dataIndex: 'internalAccount' },
                                                     { id: 'branchNotif', header: 'REGION', width: 200, hidden: true, sortable: true, dataIndex: 'branchNotif' }
                                                ],
                                                listeners: {
                                                    'afterrender': function () {
                                                        getBranchList(Ext.getCmp('gBrnInfo'));
                                                    },
                                                    'rowclick': function (e, t) {
                                                        var a = e.getStore().getAt(t);
                                                        var st = a.get('bname');
                                                    },
                                                    'rowdblclick': function (e, t) {
                                                        var a = e.getStore().getAt(t);
                                                        BRANCHRKD = a;
                                                        $('#bcod').val(a.get('branchCode').toString());
                                                        $('#brn').val(a.get('bname').toString());
                                                        $('#moniker').val(a.get('mnemonic').toString());
                                                        $('#rg').val(a.get('region').toString());
                                                        $('#intAcct').val(a.get('internalAccount').toString());
                                                        $('#moniker').val(a.get('mnemonic').toString());
                                                        $('#brEmail').val(a.get('branchNotif').toString());
                                                    }
                                                }
                                            })
                                        ]
                                    }
                                ]
                            },
                            {
                                title: 'Category Setup', height: 300, defaults: { xtype: 'form', frame: true, border: true },layout: 'form',
                                items: [
                                    {
                                        id: 'frmCatP', title: 'Product Category', defaults: { xtype: 'textfield', anchor: '90%', allowBlank: false },
                                        items: [
                                            { id: 'Ccde', fieldLabel: 'Category Code' },
                                            { id: 'Ccat', fieldLabel: 'Category' },
                                            { id: 'Camt', fieldLabel: 'Control Amount' },
                                            { id: 'Cactno', fieldLabel: 'Accnt No' },
                                            { id: 'Cactname', fieldLabel: 'Accnt Name' }
                                        ],
                                        buttons: [
                                            {
                                                id: 'btnCsave', text: 'Save',
                                                listeners: {
                                                    'click': function (btn) {
                                                        var f = Ext.getCmp('frmCatP').getForm();
                                                        if (f.isValid()) {
                                                            if (parseInt(PRDCAT.get('Id')) > 0) {
                                                                $.post('/Product/updateGeneralCategoryList',
                                                                    {
                                                                        catId: parseInt(PRDCAT.get('Id')),code: Ext.fly('Ccde').getValue(), codeValue: Ext.fly('Ccat').getValue(),
                                                                        Amt: Ext.fly('Camt').getValue(), Accnt: Ext.fly('Cactno').getValue(),
                                                                        AccntName: Ext.fly('Cactname').getValue()
                                                                    },
                                                                    function (rp) {
                                                                        if (rp.status.toString() == "true") {
                                                                            Ext.Msg.alert('CATEGORY LIST UPDATE', 'General Category Record updated successfully', this);
                                                                            PRDCAT = '';
                                                                            $('#btnCclr').trigger('click');
                                                                            Ext.getCmp('grdCatLst').getStore().removeAll();
                                                                            getCategoryList(Ext.getCmp('grdCatLst'));
                                                                        }
                                                                    }, "json");

                                                                return false;
                                                            }

                                                            $.post('/Product/addGeneralCategoryList',
                                                                {
                                                                    code: Ext.fly('Ccde').getValue(), codeValue: Ext.fly('Ccat').getValue(),
                                                                    Amt: Ext.fly('Camt').getValue(), Accnt: Ext.fly('Cactno').getValue(),
                                                                    AccntName: Ext.fly('Cactname').getValue()
                                                                },
                                                                function (rst) {
                                                                if (rst.status.toString() == "true") {
                                                                    getCategoryList(Ext.getCmp('grdCatLst'));
                                                                    $('#btnCclr').trigger('click');
                                                                }
                                                            },"json");
                                                        }
                                                    }
                                                }
                                            }, {
                                                id: 'btnCclr', text: 'Clear',
                                                listeners: {
                                                    'click': function () {
                                                        Ext.getCmp('frmCatP').getForm().reset();
                                                        $('#Ccde').focus();
                                                    }
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        id: '', title: 'Category List',
                                        items: [
                                            new Ext.grid.GridPanel({
                                                id: 'grdCatLst', title: '', height: 220, autoScroll: true,
                                                store: new Ext.data.GroupingStore({
                                                    reader: new Ext.data.ArrayReader({}, [
                                                        { name: 'Id', type: 'int' },
                                                        { name: 'categoryLookup', type: 'string' },
                                                        { name: 'categoryValue', type: 'string' },
                                                        { name: 'Account', type: 'string' },
                                                        { name: 'categoryControlAmount', type: 'string' },
                                                        { name: 'AccountName', type: 'string' }
                                                    ]),
                                                    sortInfo: {
                                                        field: "Id",
                                                        direction: "ASC"
                                                    },
                                                    groupField: "categoryValue"
                                                }),
                                                columns: [
                                                     { id: 'Id', header: 'CATEGORY_ID', width: 90, hidden: true, sortable: true, dataIndex: 'Id' },
                                                     { id: 'categoryLookup', header: 'CATEGORY', width: 160, hidden: false, sortable: true, dataIndex: 'categoryLookup' },
                                                     { id: 'categoryValue', header: 'CATEGORY.VALUE', width: 200, hidden: false, sortable: true, dataIndex: 'categoryValue' },
                                                     { id: 'Account', header: 'A/C', width: 200, hidden: false, sortable: true, dataIndex: 'Account' },
                                                     { id: 'categoryControlAmount', header: 'CNTRL.AMT', width: 200, hidden: true, sortable: true, dataIndex: 'categoryControlAmount' },
                                                     { id: 'AccountName', header: 'A/C NAME', width: 200, hidden: true, sortable: true, dataIndex: 'AccountName' }
                                                ],
                                                listeners: {
                                                    'afterrender': function () {
                                                        getCategoryList(Ext.getCmp('grdCatLst'));
                                                    },
                                                    'rowdblclick': function (e, t) {
                                                        var a = e.getStore().getAt(t);
                                                        PRDCAT = a;
                                                        $('#Ccde').val(a.get('categoryLookup'));
                                                        $('#Ccat').val(a.get('categoryValue'));
                                                        $('#Camt').val(a.get('categoryControlAmount'));
                                                        $('#Cactno').val(a.get('Account'));
                                                        $('#Cactname').val(a.get('AccountName'));
                                                    }
                                                }
                                            })
                                        ]
                                    }
                                ]
                            },
                            {
                                title: 'Product Category Setup', height: 300, defaults: { xtype: 'form', frame: true, border: true }, layout: 'form',
                                items: [
                                    {
                                        id: 'frmPCat', defaults: { xtype: 'textfield', anchor: '90%', allowBlank: false },
                                        items: [
                                            { id: 'pcode', fieldLabel: 'Product Code' },
                                            { id: 'pname', fieldLabel: 'Product Name' },
                                            {
                                                xtype: 'combo', id: 'pCatt', fieldLabel: 'Parent Category', mode: 'local',
                                                store: new Ext.data.Store({
                                                    id: '', autoLoad: true, restful: false,
                                                    url: '/Product/getCategoryList',
                                                    reader: new Ext.data.JsonReader({ type: 'json', root: 'msg'}, [
                                                        { name: 'Id', type: 'int' },
                                                        { name: 'categoryLookup', type: 'string' }
                                                    ])
                                                }), valueField: 'Id', displayField: 'categoryLookup', forceSelection: true, typeAhead: true, allowBlank: false
                                            },
                                            { xtype: 'datefield', id: 'pdte', fieldLabel: 'Date', format: 'd/m/Y' },
                                            { xtype: 'textarea', id: 'pcomments', fieldLabel: 'Comments', allowBlank: true }
                                        ],
                                        buttons: [
                                            {
                                                text: 'Save',
                                                id: 'btnPsave',
                                                listeners: {
                                                    'click': function (btn) {
                                                        var frm = Ext.getCmp('frmPCat').getForm();
                                                        if (frm.isValid())
                                                        {
                                                            if (updateFlag == true)
                                                            {
                                                                //console.log('updating operation initiated'); return false;
                                                                $.post('/Product/updateProductCategory',
                                                                    {
                                                                        pCatId: parseInt(PRDT.get('Id')), pcode: Ext.fly('pcode').getValue(), pname: Ext.fly('pname').getValue(),
                                                                        pdte: Ext.fly('pdte').getValue(), pcomments: Ext.fly('pcomments').getValue(),
                                                                        pCat: Ext.fly('pCatt').getValue()
                                                                    },
                                                                    function (rsp) {
                                                                        if (rsp.status.toString() == "true") {
                                                                            PRDT = '';
                                                                            Ext.Msg.alert('PRODUCT CATEGORY UPDATE', 'Product Category Record has been updated successfully', this);
                                                                            getProductCategoryList(Ext.getCmp('gPCat'))
                                                                            $('#btnPclr').trigger('click');
                                                                        }
                                                                    }, "json");
                                                                updateFlag = false;
                                                            }
                                                            else
                                                            {
                                                                //console.log('saving operation initiated'); return false;
                                                                $.post('/Product/addProductCategory',
                                                                {
                                                                    pcode: Ext.fly('pcode').getValue(), pname: Ext.fly('pname').getValue(),
                                                                    pdte: Ext.fly('pdte').getValue(), pcomments: Ext.fly('pcomments').getValue(),
                                                                    pCat: Ext.fly('pCatt').getValue()
                                                                }, function (stat) {
                                                                    if (stat.status.toString() == "true") {
                                                                        getProductCategoryList(Ext.getCmp('gPCat'));
                                                                        $('#btnPclr').trigger('click');
                                                                    }
                                                                }, "json");
                                                            }
                                                        }
                                                    }
                                                }
                                            }, {
                                                text: 'Clear',
                                                id: 'btnPclr',
                                                listeners: {
                                                    'click': function (btn) {
                                                        Ext.getCmp("frmPCat").getForm().reset()
                                                        $('#pcode').focus();
                                                    }
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        id: 'frmgPCat',
                                        items: [
                                            new Ext.grid.GridPanel({
                                                id: 'gPCat', title: '', height: 220, autoScroll: true,
                                                store: new Ext.data.GroupingStore({
                                                    reader: new Ext.data.ArrayReader({}, [
                                                        { name: 'Id', type: 'int' },
                                                        { name: 'productCode', type: 'string' },
                                                        { name: 'productCodeValue', type: 'string' },
                                                        { name: 'dte', type: 'string' },
                                                        { name: 'comment', type: 'string' },
                                                        { name: 'categoryValue', type: 'string' }
                                                    ]),
                                                    sortInfo: {
                                                        field: "Id",
                                                        direction: "ASC"
                                                    },
                                                    groupField: "productCode"
                                                }),
                                                columns: [
                                                     { id: 'Id', header: 'ID', width: 90, hidden: true, sortable: true, dataIndex: 'Id' },
                                                     { id: 'productCode', header: 'PRODUCT.CODE', width: 160, hidden: false, sortable: true, dataIndex: 'productCode' },
                                                     { id: 'productCodeValue', header: 'PRODUCT', width: 200, hidden: false, sortable: true, dataIndex: 'productCodeValue' },
                                                     { id: 'dte', header: 'PRODUCT', width: 200, hidden: false, sortable: true, dataIndex: 'dte' },
                                                     { id: 'comment', header: 'PRODUCT', width: 200, hidden: false, sortable: true, dataIndex: 'comment' },
                                                     { id: 'categoryValue', header: 'PRODUCT', width: 200, hidden: false, sortable: true, dataIndex: 'categoryValue' }
                                                ],
                                                listeners: {
                                                    'render': function () {
                                                        setInterval(function () {
                                                            getProductCategoryList(Ext.getCmp('gPCat'))
                                                        }, 50000);
                                                    },
                                                    'afterrender': function () {
                                                        setInterval(getProductCategoryList(Ext.getCmp('gPCat')), 50000);
                                                    },
                                                    'rowclick': function (e, t) {
                                                        var a = e.getStore().getAt(t);
                                                        PRDT = a;
                                                        var str = a.get('productCode');
                                                    },
                                                    'rowdblclick': function (e, t) {
                                                        updateFlag = true;
                                                        var a = e.getStore().getAt(t);
                                                        PRDT = a;
                                                        $('#pcode').val(a.get('productCode'));
                                                        $('#pname').val(a.get('productCodeValue'));
                                                        $('#pCatt').val(a.get('categoryValue'));
                                                        $('#pdte').val(new Date().toJSON().substring(0,10),"dd/M/YYYY");
                                                        $('#pcomments').val(a.get('comment'));
                                                    }
                                                }
                                            })
                                        ]
                                    }
                                ]
                            },
                            {
                                title: 'Stock Threshold Setup', height: 300, defaults: { xtype: 'form', frame: true, border: true }, layout: 'form',
                                items: [
                                    {
                                        id: 'frmStk', defaults: { xtype: 'combo',  anchor: '90%' },
                                        items: [
                                            {
                                                id: 'cboStkPrd', fieldLabel: 'Product', mode: 'local',
                                                store: new Ext.data.Store({
                                                    autoLoad: true, restful: false,
                                                    url: '/Product/getProductCodes',
                                                    reader: new Ext.data.JsonReader({}, [
                                                        { name: 'Id', type: 'int' },
                                                        { name: 'productCode', type: 'string' }
                                                    ])
                                                }), valueField: 'Id', displayField: 'productCode', allowBlank: false, forceSelection: true, typeAhead: true
                                            },
                                            {
                                                id: 'cboStkMet', fieldLabel: 'Metric',mode: 'local',
                                                store: new Ext.data.Store({
                                                    autoLoad: true, restful: false,
                                                    url: '/Helper/getMetrics',
                                                    reader: new Ext.data.JsonReader({}, [
                                                        { name: 'Id', type: 'int' },
                                                        { name: 'metric_name', type: 'string' }
                                                    ])
                                                }), valueField: 'Id', displayField: 'metric_name', allowBlank: false, forceSelection: true, typeAhead: true
                                            },
                                            { xtype: 'numberfield', id: 'StkT', fieldLabel: 'Threshold Value' },
                                            { xtype: 'numberfield', id: 'StKTLimit', fieldLabel: 'Threshold Limit' }
                                        ],
                                        buttons: [
                                            {
                                                text: 'Save', id: 'btnStkSv',
                                                listeners: {
                                                    'click': function (btn) {
                                                        var f = Ext.getCmp('frmStk').getForm();
                                                        if (f.isValid()) {
                                                            if (parseInt(THRESH.get('Id')) > 0) {
                                                                $.post('/Product/updateProductMetrics',
                                                                    { stkId: parseInt(THRESH.get('Id')), prd: Ext.fly('cboStkPrd').getValue(), metrics: Ext.fly('cboStkMet').getValue(), tValue: Ext.fly('StkT').getValue(), tCeiling: Ext.fly('StKTLimit').getValue() },
                                                                    function (rs) {
                                                                    if (rs.status.toString() == "true") {
                                                                        Ext.Msg.alert('STOCK THRESHOLD UPDATE STATUS', 'Stock Threshold record has been updated successfully', this);
                                                                        THRESH = '';
                                                                        getProductMeasurement(Ext.getCmp('gStkLst'));
                                                                        $('#btnStkClr').trigger('click');
                                                                    }
                                                                }, "json");
                                                                return false;
                                                            }
                                                            $.post('/Product/addStockThreshold',
                                                                { prd: Ext.fly('cboStkPrd').getValue(), metrics: Ext.fly('cboStkMet').getValue(), tValue: Ext.fly('StkT').getValue(), tLimit: Ext.fly('StKTLimit').getValue() },
                                                                function (rsp) {
                                                                    if (rsp.toString() == "true") {
                                                                        getProductMeasurement(Ext.getCmp('gStkLst'));
                                                                        $('#btnStkClr').trigger('click');
                                                                    }
                                                                }, "json");
                                                        }
                                                    }
                                                }
                                            },
                                            { 
                                                id: 'btnStkClr',text: 'Clear',
                                                listeners: {
                                                    'click': function (btn) {
                                                        Ext.getCmp('frmStk').getForm().reset();
                                                        $('#cboStkPrd').focus();
                                                    }
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        id: '',
                                        items: [
                                            new Ext.grid.GridPanel({
                                                id: 'gStkLst', title: '', height: 300, autoScroll: true,
                                                store: new Ext.data.GroupingStore({
                                                    reader: new Ext.data.ArrayReader({}, [
                                                        { name: 'Id', type: 'int'},
                                                        { name: 'productCode', type: 'string' },
                                                        { name: 'metric_name', type: 'string' },
                                                        { name: 'thresholdValue', type: 'string' },
                                                        { name: 'thresholdCeiling', type: 'string' },
                                                        { name: 'productCodeValue', type: 'string' }
                                                    ]),
                                                    sortInfo: {
                                                        field: "productCode",
                                                        direction: "ASC"
                                                    },
                                                    groupField: "productCode"
                                                }),
                                                columns: [
                                                     { id: 'Id', header: 'ID', width: 60, hidden: true, sortable: true, dataIndex: 'Id' },
                                                     { id: 'productCode', header: 'PRODUCT', width: 100, hidden: false, sortable: true, dataIndex: 'productCode' },
                                                     { id: 'metric_name', header: 'METRIC', width: 100, hidden: false, sortable: true, dataIndex: 'metric_name' },
                                                     { id: 'thresholdValue', header: 'FLOOR', width: 100, hidden: false, sortable: true, dataIndex: 'thresholdValue' },
                                                     { id: 'thresholdCeiling', header: 'LIMIT', width: 100, hidden: false, sortable: true, dataIndex: 'thresholdCeiling' },
                                                     { id: 'productCodeValue', header: 'PVALUE', width: 100, hidden: true, sortable: true, dataIndex: 'productCodeValue' }
                                                ],
                                                listeners: {
                                                    'afterrender': function () {
                                                        getProductMeasurement(Ext.getCmp('gStkLst'));
                                                    },
                                                    'rowdblclick': function (e, t) {
                                                        var a = e.getStore().getAt(t);
                                                        THRESH = a;
                                                        $('#cboStkPrd').val(a.get('productCodeValue'));
                                                        $('#cboStkMet').val(a.get('metric_name'));
                                                        $('#StkT').val(a.get('thresholdValue'));
                                                        $('#StKTLimit').val(a.get('thresholdCeiling'));
                                                    }
                                                }
                                            })
                                        ]
                                    }
                                ]
                            },
                            {
                                title: 'Stores Account Setup', height: 300, defaults: { xtype: 'form', frame: true, border: true },
                                items: [
                                    {
                                        id: 'frmStrs', defaults: { xtype: 'combo', anchor: '90%' },
                                        items: [
                                            { xtype: 'textfield', id: 'strsact', fieldLabel: 'Account No' },
                                            { xtype: 'textfield', id: 'strsactname', fieldLabel: 'Account Name'},
                                            {
                                                id: 'strsbr', fieldLabel: 'Branch', typeAhead: true, forceSelection: true, mode: 'local',
                                                store: new Ext.data.Store({
                                                    id: '', autoLoad: true, restful: false,
                                                    url: '/Product/getBranchAndIDs',
                                                    reader: new Ext.data.JsonReader({}, [
                                                        { name: 'Id', type: 'int' },
                                                        { name: 'branchName', type: 'string' }
                                                    ])
                                                }), valueField: '', displayField: 'branchName'
                                            }
                                        ],
                                        buttons: [
                                            {
                                                id: 'btnStsv', text: 'Save',
                                                listeners: {
                                                    'click': function (btn) {
                                                        var f = Ext.getCmp('frmStrs').getForm();
                                                        if (f.isValid()) {
                                                            if (parseInt(STOR.get('Id')) > 0) {
                                                                $.post('/Product/updateStoresAccount',
                                                                    { stId: parseInt(STOR.get('Id')), act: Ext.fly('strsact').getValue(), actName: Ext.fly('strsactname').getValue(), b: Ext.fly('strsbr').getValue() },
                                                                    function (rsp) {
                                                                        if (rsp.status.toString() == "true") {
                                                                            Ext.Msg.alert('STORES ACCOUNT UPDATE', 'Stores Account record updated successfully', this);
                                                                            STOR = '';
                                                                            $('#btnStclr').trigger('click');
                                                                            getStoreAccountList(Ext.getCmp('grdStrsAct'))
                                                                        }
                                                                }, "json");
                                                                return false;
                                                            }

                                                            $.post('/Product/addStoresAccount',
                                                                {act:Ext.fly('strsact').getValue(),actName:Ext.fly('strsactname').getValue(),b:Ext.fly('strsbr').getValue()},
                                                                function (rs) {
                                                                    if (rs.status.toString() == "true") {
                                                                        getStoreAccountList(Ext.getCmp('grdStrsAct'));  //refresh the grid box
                                                                        $('#btnStclr').trigger('click');
                                                                    }
                                                            }, "json");
                                                        }
                                                    }
                                                }
                                            },
                                            {
                                                id: 'btnStclr', text: 'Clear',
                                                listeners: {
                                                    'click': function (btn) {
                                                        Ext.getCmp('frmStrs').getForm().reset();
                                                        $('#strsact').focus();
                                                    }
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        id: '',
                                        items: [
                                            new Ext.grid.GridPanel({
                                                id: 'grdStrsAct', title: '', height: 300, autoScroll: true,
                                                store: new Ext.data.GroupingStore({
                                                    reader: new Ext.data.ArrayReader({}, [
                                                        { name: 'Id', type: 'int'},
                                                        { name: 'accountNumber', type: 'string' },
                                                        { name: 'accountName', type: 'string' },
                                                        { name: 'branchName', type: 'string' }
                                                    ]),
                                                    sortInfo: {
                                                        field: "accountNumber",
                                                        direction: "ASC"
                                                    },
                                                    groupField: "branchName"
                                                }),
                                                columns: [
                                                     { id: 'Id', header: 'ID', width: 60, hidden: true, sortable: true, dataIndex: 'Id' },
                                                     { id: 'accountNumber', header: 'ACCOUNT.No', width: 160, hidden: false, sortable: true, dataIndex: 'accountNumber' },
                                                     { id: 'accountName', header: 'ACCOUNT.NAME', width: 200, hidden: false, sortable: true, dataIndex: 'accountName' },
                                                     { id: 'branchName', header: 'BRANCH', width: 200, hidden: false, sortable: true, dataIndex: 'branchName' }
                                                ],
                                                listeners: {
                                                    'afterrender': function () {
                                                        setInterval(getStoreAccountList(Ext.getCmp('grdStrsAct')), 1000);
                                                    },
                                                    'rowdblclick': function (e, t) {
                                                        var a = e.getStore().getAt(t);
                                                        STOR = a;
                                                        $('#strsact').val(a.get('accountNumber'));
                                                        $('#strsactname').val(a.get('accountName'));
                                                        $('#strsbr').val(a.get('branchName'));
                                                    }
                                                }
                                            })
                                        ]
                                    }
                                ]
                            },
                            {
                                title: 'User Notifications', height: 300, defaults: { xtype: 'form', frame: true, border: true }, layout: 'form',
                                items: [
                                    {
                                        id: 'frmUsrAdd', defaults: { xtype: 'textfield', anchor: '90%', allowBlank: false },
                                        items: [
                                            { id: 'ust', fieldLabel: 'Staff No' },
                                            { id: 'usn', fieldLabel: 'Surname' },
                                            { id: 'ufn', fieldLabel: 'Firstname'},
                                            { id: 'uso', fieldLabel: 'Othernames' },
                                            {
                                                xtype: 'combo', id: 'usb', fieldLabel: 'Branch', forceSelection: true, typeAhead: true, mode: 'local',
                                                store: new Ext.data.Store({
                                                    id: '',autoLoad: true, restful: false,
                                                    url: '/Product/getBranchAndIDs',
                                                    reader: new Ext.data.JsonReader({}, [
                                                        { name: 'Id', type: 'int' },
                                                        { name: 'branchName', type: 'string' }
                                                    ])
                                                }), valueField: 'Id', displayField: 'branchName'
                                            },
                                            { id: 'usem', fieldLabel: 'Email' },
                                            { id: 'ustel', fieldLabel: 'Telephone' },
                                            {
                                                xtype: 'combo', id: 'usnCt', fieldLabel: 'Category', forceSelection: true, typeAhead: true, mode: 'local',
                                                store: new Ext.data.Store({
                                                    id: '', autoLoad: true, restful: false,
                                                    url: '/Helper/getNotificationGroup',
                                                    reader: new Ext.data.JsonReader({root: 'data'}, [
                                                        { name: 'Id', type: 'int' },
                                                        { name: 'CategoryOfNotification', type: 'string' }
                                                    ])
                                                }), valueField: 'Id', displayField: 'CategoryOfNotification'
                                            },
                                            { xtype: 'combo', id: 'usmde', fieldLabel: 'Mode', typeAhead: true, forceSelection: '', mode: 'local', store: ['EMAIL','TELEPHONE','BOTH'] },
                                            { xtype: 'combo', id: 'usstat', fieldLabel: 'Status', typeAhead: true, forceSelection: '', mode: 'local', store: ['ACTIVE'] }
                                        ],
                                        buttons: [
                                            {
                                                id: 'btnUsrSv',
                                                text: 'Save',
                                                listeners: {
                                                    'click': function (btn)
                                                    {
                                                        var f = Ext.getCmp('frmUsrAdd').getForm();
                                                        if (f.isValid())
                                                        {
                                                            if (uNOTIFFLAG > 0) {
                                                                $.post('/User/updateNotifier',
                                                                {
                                                                    nId: parseInt(uNOTIF.get('Id')), st: Ext.fly('ust').getValue(), sn: Ext.fly('usn').getValue(),
                                                                    fn: Ext.fly('ufn').getValue(), on: Ext.fly('uso').getValue(), d: Ext.fly('usb').getValue(),
                                                                    em: Ext.fly('usem').getValue(), cnt: Ext.fly('ustel').getValue(),
                                                                    mode: Ext.fly('usmde').getValue(), cat: Ext.fly('usnCt').getValue()
                                                                },
                                                                function (rsp) {
                                                                    if (rsp.status.toString() == "true") {
                                                                        Ext.Msg.alert('USER NOTIFICATION UPDATE', 'User notification record updated successfully', this);
                                                                        $('#btnUsrClr').trigger('click');
                                                                        $('#btnUsrRf').trigger('click');
                                                                    }
                                                                }, "json");

                                                                return false;
                                                            }
                                                            else
                                                            {
                                                                $.post('/User/addNotifier',
                                                                {
                                                                    st: Ext.fly('ust').getValue(), sn: Ext.fly('usn').getValue(), fn: Ext.fly('ufn').getValue(),
                                                                    on: Ext.fly('uso').getValue(), d: Ext.fly('usb').getValue(),
                                                                    em: Ext.fly('usem').getValue(), cnt: Ext.fly('ustel').getValue(),
                                                                    mode: Ext.fly('usmde').getValue(), cat: Ext.getCmp('usnCt').getValue()
                                                                },
                                                                function (rs) {
                                                                    if (rs.status.toString() == "true") {
                                                                        getUserNotifiers(Ext.getCmp('grdUsrNotif'));
                                                                        $('#btnUsrClr').trigger('click');
                                                                    }
                                                                }, "json");
                                                            }
                                                        } 
                                                    }
                                                }
                                            },
                                            {
                                                id: 'btnUsrClr', text: 'Clear',
                                                listeners: {
                                                    'click': function (btn) {
                                                        Ext.getCmp('frmUsrAdd').getForm().reset();
                                                        uNOTIF = '';
                                                        uNOTIFFLAG = 0;
                                                        $('#ust').focus();
                                                    }
                                                }
                                            },
                                            {
                                                id: 'btnUsrRf', text: 'Refresh', hidden: true,
                                                listeners: {
                                                    'click': function (btn) {
                                                        getUserNotifiers(Ext.getCmp('grdUsrNotif'));
                                                    }
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        id: '',
                                        items: [
                                            new Ext.grid.GridPanel({
                                                id: 'grdUsrNotif', title: '', height: 300, autoScroll: true,
                                                store: new Ext.data.GroupingStore({
                                                    reader: new Ext.data.ArrayReader({}, [
                                                        { name: 'Id', type: 'int' },
                                                        { name: 'staffNo', type: 'string' },
                                                        { name: 'surname', type: 'string' },
                                                        { name: 'emailAddress', type: 'string' },
                                                        { name: 'contactNumber', type: 'string' },
                                                        { name: 'branchName', type: 'string' },
                                                        { name: 'firstname', type: 'string' },
                                                        { name: 'othernames', type: 'string' },
                                                        { name: 'CategoryOfNotification', type: 'string' }
                                                    ]),
                                                    sortInfo: {
                                                        field: "staffNo",
                                                        direction: "ASC"
                                                    },
                                                    groupField: "CategoryOfNotification"
                                                }),
                                                columns: [
                                                     { id: 'Id', header: 'ID', width: 40, hidden: true, sortable: true, dataIndex: 'Id' },
                                                     { id: 'staffNo', header: 'STAFF.No', width: 80, hidden: false, sortable: true, dataIndex: 'staffNo' },
                                                     { id: 'surname', header: 'STAFF.NAME', width: 150, hidden: false, sortable: true, dataIndex: 'surname' },
                                                     { id: 'emailAddress', header: 'EMAIL', width: 120, hidden: false, sortable: true, dataIndex: 'emailAddress' },
                                                     { id: 'contactNumber', header: 'TELEPHONE', width: 80, hidden: false, sortable: true, dataIndex: 'contactNumber' },
                                                     { id: 'branchName', header: 'BRANCH', width: 150, hidden: false, sortable: true, dataIndex: 'branchName' },
                                                     { id: 'firstname', header: 'FIRSTNAME', width: 150, hidden: true, sortable: true, dataIndex: 'firstname' },
                                                     { id: 'othernames', header: 'OTHERNAMES', width: 150, hidden: true, sortable: true, dataIndex: 'othernames' },
                                                     { id: 'CategoryOfNotification', header: '', width: 150, hidden: true, sortable: true, dataIndex: 'CategoryOfNotification' }
                                                ],view: new Ext.grid.GroupingView({
                                                    forceFit: !0,
                                                    groupTextTpl: '{text} ({[values.rs.length]} {[values.rs.length > 1 ? "Notifiers" : "Notifier"]})',
                                                    getRowClass: function (e, t) {
                                                        return t % 1 > 0 ? "odd" : "even"
                                                    }
                                                }), listeners: {
                                                    'afterrender': function () {
                                                        getUserNotifiers(Ext.getCmp('grdUsrNotif'));
                                                    },
                                                    'rowdblclick': function (e, t) {
                                                        var a = e.getStore().getAt(t);
                                                        uNOTIF = a;
                                                        uNOTIFFLAG = parseInt(uNOTIF.get('Id'));
                                                        $('#ust').val(a.get('staffNo'));
                                                        var arr = a.get('surname').split(',');
                                                        $('#usn').val(arr[0]);
                                                        $('#ufn').val(a.get('firstname'));
                                                        $('#uso').val(a.get('othernames'));
                                                        $('#usb').val(a.get('branchName'));
                                                        $('#usem').val(a.get('emailAddress'));
                                                        $('#ustel').val(a.get('contactNumber'));
                                                        $('#usnCt').val(a.get('CategoryOfNotification'));
                                                    }
                                                }
                                            })
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        title: '', width: '65%', defaults: { xtype: 'tabpanel', tabPosition: 'bottom', frame: true, height: 650 },layout: 'form',
                        items: [
                            {
                                activeTab: 0, enableScroll: true,
                                items: [
                                    {
                                        title: 'Supplier Details', defaults: { xtype: 'form', frame: true, border: true, allowBlank: false }, layout: 'column',
                                        items: [
                                            {
                                                id: 'frmSpInfo', title: 'Supplier Info', defaults: { xtype: 'textfield', anchor: '90%' },width: '45%', height: 400,
                                                items: [
                                                    { id: 'scd', fieldLabel: 'Supplier Code' },
                                                    { id: 'spn', fieldLabel: 'Supplier' },
                                                    { id: 'spcntP', fieldLabel: 'Contact Person' },
                                                    { id: 'spcntN', fieldLabel: 'Contact Number' },
                                                    { xtype: 'textarea', id: 'spAddr', fieldLabel: 'Address' }
                                                ],
                                                buttons: [
                                                    {
                                                        text: 'Save',
                                                        id: 'btnSpSave',
                                                        listeners: {
                                                            'click': function (btn) {
                                                                var fp = Ext.getCmp('frmSpInfo').getForm();
                                                                if (fp.isValid()) {
                                                                    $.post('/Supplier/addSupplier',
                                                                        {
                                                                            scode: Ext.fly('scd').getValue(), sup: Ext.fly('spn').getValue(),
                                                                            cntactN: Ext.fly('spcntN').getValue(), cntactP: Ext.fly('spcntP').getValue(),
                                                                            supAddr: Ext.fly('spAddr').getValue()
                                                                        },
                                                                        function (rs) {
                                                                            if (rs.status.toString() == "true") {
                                                                                getSuppliers(Ext.getCmp('grdSpInfo'));
                                                                                $('#btnSpClr').trigger('click');
                                                                            }
                                                                    },"json");
                                                                }
                                                            }
                                                        }
                                                    },
                                                    {
                                                        text: 'Clear',
                                                        id: 'btnSpClr',
                                                        listeners: {
                                                            'click': function (btn) {
                                                                Ext.getCmp('frmSpInfo').getForm().reset();
                                                                $('#scd').focus();
                                                            }
                                                        }
                                                    },
                                                    { text: 'Close' }
                                                ]
                                            },
                                            {
                                                title: 'Supplier List', width: '55%', height: 660,
                                                items: [
                                                    new Ext.grid.GridPanel({
                                                        id: 'grdSpInfo', title: '', height: 590, autoScroll: true,
                                                        store: new Ext.data.GroupingStore({
                                                            reader: new Ext.data.ArrayReader({}, [
                                                                { name: 'Id', type: 'int' },
                                                                { name: 'sup_code', type: 'string' },
                                                                { name: 'sup_name', type: 'string' },
                                                                { name: 'contactPerson', type: 'string' },
                                                                { name: 'contactNumber', type: 'string' }
                                                            ]),
                                                            sortInfo: {
                                                                field: "sup_name",
                                                                direction: "ASC"
                                                            },
                                                            groupField: "sup_name"
                                                        }),
                                                        columns: [
                                                             { id: 'id', header: 'ID', width: 60, hidden: true, sortable: true, dataIndex: 'id' },
                                                             { id: 'sup_code', header: 'CODE', width: 70, hidden: false, sortable: true, dataIndex: 'sup_code' },
                                                             { id: 'sup_name', header: 'SUPPLIER', width: 150, hidden: false, sortable: true, dataIndex: 'sup_name' },
                                                             { id: 'contactPerson', header: 'CONTACT.PERSON', width: 100, hidden: false, sortable: true, dataIndex: 'contactPerson' },
                                                             { id: 'contactNumber', header: 'CONTACT.NUMBER', width: 80, hidden: false, sortable: true, dataIndex: 'contactNumber' }
                                                        ],
                                                        listeners: {
                                                            'afterrender': function () {
                                                                getSuppliers(Ext.getCmp('grdSpInfo'));
                                                            }
                                                        }
                                                    })
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