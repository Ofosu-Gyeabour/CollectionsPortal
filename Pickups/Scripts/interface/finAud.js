Ext.onReady(function () {

    var chartOfaccntEditor = new Ext.ux.grid.RowEditor();
    var BUnitchartOfaccntEditor = new Ext.ux.grid.RowEditor();

    var fnd = Ext.get('finAud');
    
    var getCategoryListByFilter = function (k, param) {
        $.getJSON('/Product/getCategoryListByFilter', {filterValue: param}, function (rs) {
            if (rs.status.toString() == "true") {
                var dt = [];
                $.each(rs.msg, function (i,dd) {
                    dt[i] = [dd.Id, dd.categoryLookup, dd.categoryValue, dd.Account ];
                });

                k.getStore().loadData(dt);
            }
        });
    }

    var saveChartOfAccnt = function (bn, bc, ghs, arr) {
        if (arr.length == 0) { return false; }
        $.ajax({
            dataType: 'json',
            url: '/Product/addChartOfAccounts',
            contentType: 'application/json;charset=utf-8',
            traditional: true,
            data: {
                bId: bn, bCode: bc, bGHSAcc: ghs, items: arr
            },
            success: function (data, status, xhttp) {
                if (data.status.toString() == "true") {
                    Ext.Msg.alert('CHART OF ACCOUNTS', data.msg.toString(), this);
                }
                if (data.status.toString() == "false") {
                    Ext.Msg.alert('CHART OF ACCOUNTS', data.msg.toString(), this);
                }
            },
            error: function (data, status, xhttp) {
                Ext.Msg.alert('CHART OF ACCOUNTS', data.msg.toString(), this);
            }
        });
    }

    var getJournalRecords = function (k, f, t, b_id) {
        var jarr = [];
        $.getJSON('/Helper/getStoreJournalRecords', {df:f,dt:t,BID:b_id}, function (r) {
            if (r.status.toString() == "true") {
                $.each(r.msg, function (i, d) {
                    jarr[i] = [d.Id, d.sDte, d.objBranch.branchName, d.accountNo, d.accountName, d.debitLeg, d.creditLeg, d.narration, d.objBranch.mnemonic];
                });

                console.log(jarr);
                k.getStore().loadData(jarr);
            }
        });
    }

    var getUniqueFinDisbursements = function (k) {
        uniqueDta = [];
        $.getJSON('/Helper/getUniqueDisbursements', {}, function (r) {
            if (r.status.toString() == "true") {
                $.each(r.msg, function (i, d) {
                    uniqueDta[i] = [d.Id, d.disbursementNo];
                });

                k.getStore().loadData(uniqueDta);
            }
        });
    }

    var getUniqueBranchFDisbursements = function (k, selID) {

        uniqueDta.length = 0;
        k.getStore().removeAll();
        $.getJSON('/Helper/getUniqueBranchDisbursements', { bId: selID }, function (r) {
            if (r.status.toString() == "true") {
                $.each(r.msg, function (i, d) {
                    uniqueDta[i] = [d.Id, d.disbursementNo];
                });

                k.getStore().loadData(uniqueDta);
            }
        });
    }

    var getChartOfAccnts = function (k, selID) {
        var cht = [];
        $.getJSON('/Helper/getChartOfAccounts', {BID: selID}, function (r) {
            if (r.status.toString() == "true") {
                $.each(r.msg, function (i, d) {
                    cht[i] = [d.Id, d.category, d.reportingCategoryValue, d.creditLeg, d.debitLeg, d.debitAccountName, d.objBranch.branchName, d.objBranch.mnemonic];
                });

                console.log(cht);
                k.getStore().loadData(cht);
            }
        });
    }

    fnd.on('click', function () {

        var finWindow = Ext.getCmp('finW');
        if (!finWindow) {

            finWindow = new Ext.Window({
                id: 'finW',
                title: 'ACCOUNTING CENTER',
                height: 800,
                width: 1300,
                closable: true,
                defaults: { xtype: 'tabpanel', tabPosition: 'bottom', enableScroll: true, frame: true, border: true },
                items: [
                    {
                        activeTab: 0,
                        items: [
                            {
                                id: '', title: 'ACCOUNTS SETUP', defaults: { xtype: 'panel', frame: true, border: true, height: 700 }, layout: 'column',
                                items: [
                                    {
                                        id: '', title: 'Branch Account Setup', columnWidth:.5, defaults: { xtype: 'form', frame: true, border: true },
                                        items: [
                                            {
                                                id: 'finBranch', title: 'Branch', defaults: { xtype: 'combo', forceSelection: true, typeAhead: true, mode: 'local', anchor: '90%' },
                                                items: [
                                                    {
                                                        id: 'cbofnBranch', fieldLabel: 'Name of Branch',
                                                        store: new Ext.data.Store({
                                                            autoLoad: true, url: '/Product/getBranchListByFilter?filterValue=GH00100', restful: false,
                                                            reader: new Ext.data.JsonReader({root: 'msg'}, [
                                                                { name: 'Id', type: 'int' },
                                                                { name: 'branchName', type: 'string' }
                                                            ])
                                                        }), valueField: 'Id', displayField: 'branchName',
                                                        listeners: {
                                                            'select': function () {
                                                                $.getJSON('/Product/getBranchCode', { bId: Ext.getCmp('cbofnBranch').getValue() }, function (fin) {
                                                                    if (fin.status.toString() == "true") {
                                                                        $('#cbofnComp').val(fin.msg.toString());
                                                                        $('#cbofnGHS').val(fin.ghsAc.toString());
                                                                    }
                                                                });

                                                                getCategoryListByFilter(Ext.getCmp('grdChartOfAccounts'), '600');
                                                            }
                                                        }
                                                    },
                                                    { xtype: 'textfield', id: 'cbofnComp', fieldLabel: 'Company' },
                                                    { xtype: 'textfield', id: 'cbofnGHS', fieldLabel: 'GHS Account' }
                                                ]
                                            },
                                            {
                                                id: 'finBranchChart', title: 'Charts',
                                                items: [
                                                    new Ext.grid.GridPanel({
                                                        id: 'grdChartOfAccounts', height: 300, autoScroll: true,
                                                        plugins: [chartOfaccntEditor],
                                                        store: new Ext.data.GroupingStore({
                                                            reader: new Ext.data.ArrayReader({}, [
                                                                { name: 'Id', type: 'int' },
                                                                { name: 'categoryLookup', type: 'string' },
                                                                { name: 'categoryValue', type: 'string' },
                                                                { name: 'Account', type: 'string' },
                                                                { name: 'Dr', type: 'string' },
                                                                { name: 'AccName', type: 'string' }
                                                            ]),
                                                            sortInfo: {
                                                                field: "Id",
                                                                direction: "ASC"
                                                            },
                                                            groupField: "Id"
                                                        }),
                                                        columns: [
                                                             { id: 'Id', header: 'ID', width: 25, hidden: true, sortable: true, dataIndex: 'Id' },
                                                             { id: 'categoryLookup', header: 'REPORTING CATEGORY', width: 200, hidden: true, sortable: true, dataIndex: 'categoryLookup' },
                                                             { id: 'categoryValue', header: 'CATEGORY', width: 160, hidden: false, sortable: true, dataIndex: 'categoryValue' },
                                                             { id: 'Account', header: 'Cr A/c', width: 160, hidden: false, sortable: true, dataIndex: 'Account' },
                                                             {
                                                                 id: 'Dr', header: 'Dr A/c', width: 160, hidden: false, sortable: true, dataIndex: 'Dr',
                                                                 editor: { xtype: 'textfield', allowBlank: false }
                                                             },
                                                             {
                                                                 id: 'AccName', header: 'Dr A/c Name', width: 160, hidden: false, sortable: true, dataIndex: 'AccName',
                                                                 editor: { xtype: 'textfield', allowBlank: false }
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
                                                        id: 'finBrSave', text: 'SAVE CHART OF ACCOUNTS',
                                                        listeners: {
                                                            'click': function (btn) {
                                                                var fbr = Ext.getCmp('finBranch').getForm();
                                                                var fbc = Ext.getCmp('finBranchChart').getForm();

                                                                if (fbr.isValid() && fbc.isValid()) {
                                                                    //build an array of completed chart of accounts
                                                                    var ar = [];
                                                                    var stat = [];
                                                                    var ee = Ext.getCmp('grdChartOfAccounts').getStore().getRange();
                                                                    Ext.each(ee, function (it, idx) {
                                                                        if (it.get('Dr').length > 1) {
                                                                            ar[idx] = [it.get('Id'), it.get('categoryLookup'), it.get('categoryValue'), it.get('Account'), it.get('Dr'), it.get('AccName')];
                                                                        }
                                                                        else
                                                                        {
                                                                            Ext.Msg.alert('CHARTS', 'Please enter all fields', this);
                                                                            ar.length = 0;
                                                                            return false;
                                                                        }
                                                                    });

                                                                    if (ar.length > 0) {
                                                                        ar = ar.filter(function (val) { return val !== undefined; });
                                                                        saveChartOfAccnt(Ext.getCmp('cbofnBranch').getValue(), $('#cbofnComp').val(), $('#cbofnGHS').val(), ar);
                                                                        $('#finBrClr').trigger('click');
                                                                    }
                                                                }
                                                                
                                                            }
                                                        }
                                                    },
                                                    {
                                                        id: 'finBrClr', text: 'CLEAR BUSINESS UNIT',
                                                        listeners: {
                                                            'click': function (btn) {
                                                                Ext.getCmp('finBranch').getForm().reset();
                                                                Ext.getCmp('grdChartOfAccounts').getStore().removeAll();
                                                                Ext.getCmp('finBranchChart').getForm().reset();
                                                                $('#cbofnBranch').focus();
                                                            }
                                                        }
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        id: '', title: 'Business Unit Account Setup', columnWidth: .5, defaults: { xtype: 'form', frame: true, border: true }, 
                                        items: [
                                            {
                                                id: 'finBUnit', title: 'Business Unit', defaults: { xtype: 'combo', forceSelection: true, typeAhead: true, mode: 'local', anchor: '90%' },
                                                items: [
                                                    {
                                                        id: 'cbofnbUnit', fieldLabel: 'Business Unit',
                                                        store: new Ext.data.Store({
                                                            id: '', autoLoad: true, restful: false,
                                                            url: '/Product/getBranchListByFilter?filterValue=LN',
                                                            reader: new Ext.data.JsonReader({root: 'msg'}, [
                                                                { name: 'Id', type: 'int' },
                                                                { name: 'branchName', type: 'string' }
                                                            ])
                                                        }), valueField: 'Id', displayField: 'branchName',
                                                        listeners: {
                                                            'select': function () {
                                                                $.getJSON('/Product/getBranchCode', { bId: Ext.getCmp('cbofnbUnit').getValue() }, function (fin) {
                                                                    if (fin.status.toString() == "true") {
                                                                        $('#cbofnBUcode').val(fin.msg.toString());
                                                                        $('#cbofnBUAccnt').val(fin.ghsAc.toString());
                                                                    }
                                                                });

                                                                getCategoryListByFilter(Ext.getCmp('grdBUnitChartOfAccounts'), '600');
                                                            }
                                                        }
                                                    },
                                                    { xtype: 'textfield', id: 'cbofnBUcode', fieldLabel: 'BUnit Code' },
                                                    { xtype: 'textfield', id: 'cbofnBUAccnt', fieldLabel: 'Account' }
                                                ]
                                            },
                                            {
                                                id: 'finBunitChart', title: 'Business Unit Charts',
                                                items: [
                                                    new Ext.grid.GridPanel({
                                                        id: 'grdBUnitChartOfAccounts', height: 300, autoScroll: true,
                                                        plugins: [BUnitchartOfaccntEditor],
                                                        store: new Ext.data.GroupingStore({
                                                            reader: new Ext.data.ArrayReader({}, [
                                                                { name: 'Id', type: 'int' },
                                                                { name: 'categoryLookup', type: 'string' },
                                                                { name: 'categoryValue', type: 'string' },
                                                                { name: 'Account', type: 'string' },
                                                                { name: 'Dr', type: 'string' },
                                                                { name: 'AccName', type: 'string' }
                                                            ]),
                                                            sortInfo: {
                                                                field: "Id",
                                                                direction: "ASC"
                                                            },
                                                            groupField: "Id"
                                                        }),
                                                        columns: [
                                                             { id: 'Id', header: 'ID', width: 25, hidden: true, sortable: true, dataIndex: 'Id' },
                                                             { id: 'categoryLookup', header: 'REPORTING CATEGORY', width: 200, hidden: true, sortable: true, dataIndex: 'categoryLookup' },
                                                             { id: 'categoryValue', header: 'CATEGORY', width: 160, hidden: false, sortable: true, dataIndex: 'categoryValue' },
                                                             { id: 'Account', header: 'Cr A/c', width: 160, hidden: false, sortable: true, dataIndex: 'Account' },
                                                             {
                                                                 id: 'Dr', header: 'Dr A/c', width: 160, hidden: false, sortable: true, dataIndex: 'Dr',
                                                                 editor: { xtype: 'textfield', allowBlank: false }
                                                             },
                                                             {
                                                                 id: 'AccName', header: 'Dr A/c Name', width: 160, hidden: false, sortable: true, dataIndex: 'AccName',
                                                                 editor: { xtype: 'textfield', allowBlank: false }
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
                                                        id: 'finfbiSv', text: 'SAVE CHART OF ACCOUNTS FOR BUSINESS UNIT',
                                                        listeners: {
                                                            'click': function (btn) {
                                                                var fbi = Ext.getCmp('finBUnit').getForm();
                                                                var fbic = Ext.getCmp('finBunitChart').getForm();

                                                                if (fbi.isValid() && fbic.isValid()) {
                                                                    var arr = [];
                                                                    var chartEE = Ext.getCmp('grdBUnitChartOfAccounts').getStore().getRange();
                                                                    Ext.each(chartEE, function (it, i) {
                                                                        if (it.get('Dr').length > 1) {
                                                                            arr[i] = [it.get('Id'), it.get('categoryLookup'), it.get('categoryValue'), it.get('Account'), it.get('Dr'), it.get('AccName')];
                                                                        }
                                                                        else {
                                                                            Ext.Msg.alert('CHARTS', 'Please enter all fields', this);
                                                                            arr.length = 0;
                                                                            return false;
                                                                        }
                                                                    });

                                                                    if (arr.length > 0) {
                                                                        arr = arr.filter(function (val) { return val !== undefined; });
                                                                        saveChartOfAccnt(Ext.getCmp('cbofnbUnit').getValue(), $('#cbofnBUcode').val(), $('#cbofnBUAccnt').val(), arr);
                                                                        $('#finfbiClr').trigger('click');
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    },
                                                    {
                                                        id: 'finfbiClr', text: 'CLEAR BUSINESS UNIT',
                                                        listeners: {
                                                            'click': function (btn) {
                                                                Ext.getCmp('finBUnit').getForm().reset();
                                                                Ext.getCmp('grdBUnitChartOfAccounts').getStore().removeAll();
                                                                Ext.getCmp('finBUnitChart').getForm().reset();
                                                                $('#cbofnbUnit').focus();
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
                                id: '', title: 'CHART OF ACCOUNTS', defaults: { xtype: 'panel' }, layout: 'column',height:700,
                                items: [
                                    {
                                        id: '', defaults: { xtype: 'form', frame: true, border: true }, columnWidth: .2,
                                        items: [
                                            {
                                                id: '', defaults: { xtype: 'combo', forceSelection: true, typeAhead: true, mode: 'local', anchor: '90%'},layout:'fit',title: 'branch selection',
                                                items: [
                                                    {
                                                        id: 'chtbranch',
                                                        store: new Ext.data.Store({
                                                            autoLoad: true, restful: false,
                                                            url: '/Product/getBranchList',
                                                            reader: new Ext.data.JsonReader({ root: 'msg' }, [
                                                                { name: 'Id', type: 'int' },
                                                                { name: 'branchName', type: 'string' }
                                                            ])
                                                        }), valueField: 'Id', displayField: 'branchName'
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        id: '', defaults: { xtype: 'form', frame: true, border: true }, columnWidth: .8,
                                        items: [
                                            new Ext.grid.GridPanel({
                                                id: 'grdChrt', title: 'Account Charts', height: 600, autoScroll: true, autoExpandColumn: 'reportingCategoryValue',
                                                store: new Ext.data.GroupingStore({
                                                    reader: new Ext.data.ArrayReader({}, [
                                                        { name: 'Id', type: 'int' },
                                                        { name: 'category', type: 'string' },
                                                        { name: 'reportingCategoryValue', type: 'string' },
                                                        { name: 'creditLeg', type: 'string' },
                                                        { name: 'debitLeg', type: 'string' },
                                                        { name: 'debitAccountName', type: 'string' },
                                                        { name: 'branchName', type: 'string' },
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
                                                     { id: 'category', header: 'CATEGORY', width: 100, hidden: false, sortable: true, dataIndex: 'category' },
                                                     { id: 'reportingCategoryValue', header: 'REPORTING.LINE', width: 150, hidden: false, sortable: true, dataIndex: 'reportingCategoryValue' },
                                                     { id: 'creditLeg', header: 'CREDIT.ACCOUNT', width: 150, hidden: false, sortable: true, dataIndex: 'creditLeg' },
                                                     { id: 'debitLeg', header: 'DEBIT.ACCOUNT', width: 200, hidden: false, sortable: true, dataIndex: 'debitLeg' },
                                                     { id: 'debitAccountName', header: 'Dr ACCOUNT', width: 100, hidden: false, sortable: true, dataIndex: 'debitAccountName' },
                                                     { id: 'branchName', header: 'BRANCH', width: 100, hidden: false, sortable: true, dataIndex: 'branchName' },
                                                     { id: 'mnemonic', header: 'MNEMONIC', width: 200, hidden: false, sortable: true, dataIndex: 'mnemonic' }
                                                ], stripeRows: true,
                                                viewConfig: {
                                                    getRowClass: function (record, rowIndex, rowParams, store) {
                                                        return ((rowIndex % 2) == 0) ? "even-class" : "odd-class";
                                                    }
                                                },
                                                listeners: {
                                                    'render': function () {
                                                        getChartOfAccnts(Ext.getCmp('grdChrt'), 0);
                                                    },
                                                    'afterrender': function () {
                                                        setInterval(function () {
                                                            getChartOfAccnts(Ext.getCmp('grdChrt'), 0);
                                                        }, 90000);
                                                    }
                                                }
                                            })
                                        ],
                                        buttons: [
                                            {
                                                tpl: new Ext.XTemplate('<a id="aChrtcsv" style="display:none" href="{path}">Chart of Accounts (xlsx)</a>'), compiled: !0, data: {
                                                    path: "/Notification/AccntChart"
                                                }
                                                , autoScroll: !0
                                            },
                                            {
                                                id: '',
                                                text: 'Generate CSv',
                                                listeners: {
                                                    'click': function (btn) {
                                                        if (Ext.getCmp('grdChrt').getStore().getCount() > 0) {
                                                            window.open(document.getElementById("aChrtcsv").href, "_blank")
                                                        }
                                                    }
                                                }
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                id: '', title: 'STORES JOURNAL VOUCHER', defaults: { xtype: 'panel', frame: true, border: true, height: 700 }, layout: 'column',
                                items: [
                                    {
                                        columnWidth: .3, defaults: { xtype: 'form', frame: true, border: true },
                                        items: [
                                            {
                                                id: '', title: 'Select Branch/Business Unit', defaults: { xtype: 'combo', forceSelection: true, typeAhead: true, mode: 'local', anchor: '90%' },layout: 'fit',
                                                items: [
                                                    {
                                                        id: 'jcboBranch', 
                                                        store: new Ext.data.Store({
                                                            autoLoad: true, restful: false,
                                                            url: '/Product/getBranchList',
                                                            reader: new Ext.data.JsonReader({root: 'msg'}, [
                                                                { name: 'Id', type: 'int' },
                                                                { name: 'branchName', type: 'string' }
                                                            ])
                                                        }), valueField: 'Id', displayField: 'branchName'
                                                    }
                                                ]
                                            },
                                            {
                                                id: '', title: 'Period From', defaults: { xtype: 'datefield', anchor: '90%', format: 'd/m/Y' }, layout: 'fit',
                                                items: [
                                                    {
                                                        id: 'jDtF'
                                                    }
                                                ]
                                            },
                                            {
                                                id: '', title: 'Period To', defaults: { xtype: 'datefield', anchor: '90%', format: 'd/m/Y' }, layout: 'fit',
                                                items: [
                                                    { id: 'jDtT' }
                                                ],
                                                buttons: [
                                                    {
                                                        id: '', text: 'Fetch Results',
                                                        listeners: {
                                                            'click': function (btn) {
                                                                getJournalRecords(Ext.getCmp('grdStoreJournal'), Ext.fly('jDtF').getValue(), Ext.fly('jDtT').getValue(), Ext.getCmp('jcboBranch').getValue());
                                                            }
                                                        }
                                                    },
                                                    {
                                                        id: '', text: 'Clear',
                                                        listeners: {
                                                            'click': function (btn) {

                                                            }
                                                        }
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        columnWidth: .7, title: 'Results Panel', defaults: { xtype: 'form', frame: true, border: true },
                                        items: [
                                            new Ext.grid.GridPanel({
                                                id: 'grdStoreJournal', title: 'Store Journal', height: 400, autoScroll: true, autoExpandColumn: 'branchName',
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
                                                tpl: new Ext.XTemplate('<a id="aSTRcsv" style="display:none" href="{path}">Disbursement Report (xlsx)</a>'), compiled: !0, data: {
                                                    path: "/Notification/StoreJournalRecords"
                                                }
                                                , autoScroll: !0
                                            },
                                            {
                                                id: '', text: 'Generate CSV',
                                                listeners: {
                                                    'click': function (btn) {
                                                        if (Ext.getCmp('grdStoreJournal').getStore().getCount() > 0) {
                                                            window.open(document.getElementById("aSTRcsv").href, "_blank")
                                                        }
                                                    }
                                                }
                                            },
                                            {
                                                tpl: new Ext.XTemplate('<a id="aSTRpdf" style="display:none" href="{path}">Disbursement Report (xlsx)</a>'), compiled: !0, data: {
                                                    path: "/Notification/DisbursementExcelReport"
                                                }
                                                , autoScroll: !0
                                            }
                                            /*,
                                            {
                                                id: '', text: 'Print',
                                                listeners: {
                                                    'click': function (btn) {

                                                    }
                                                }
                                            }
                                            */
                                        ]
                                    }
                                ]
                            },
                            {
                                id: '', title: 'STORES ISSUE VOUCHER', defaults: { xtype: 'panel', frame: true, border: true }, height: 700, layout: 'column',
                                items: [
                                    {
                                        columnWidth: .3, defaults: { xtype: 'form', frame: true, border: true }, height: 680,title:'query panel',
                                        items: [
                                            {
                                                id: '', title: 'filter for branch or department disbursements', defaults: { xtype: 'combo', forceSelection: true, typeAhead: true, mode: 'local', anchor: '90%' }, layout: 'fit',
                                                items: [
                                                    {
                                                        id: 'cboFRptDept',
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
                                                                if (Ext.getCmp('grdFStkIssueRpt').getStore().getCount() > 0) {
                                                                    getUniqueBranchFDisbursements(Ext.getCmp('grdFStkIssueRpt'), Ext.getCmp('cboFRptDept').getValue());
                                                                    Ext.getCmp('grdFStkIssueRptDetails').getStore().removeAll();
                                                                }
                                                                else {
                                                                    getUniqueFinDisbursements(Ext.getCmp('grdFStkIssueRpt'));
                                                                    Ext.getCmp('grdFStkIssueRptDetails').getStore().removeAll();
                                                                }
                                                            }
                                                        }
                                                    }
                                                ]
                                            },
                                            {
                                                id: '', height: 600,
                                                items: [
                                                    new Ext.grid.GridPanel({
                                                        id: 'grdFStkIssueRpt', title: '', autoScroll: true, autoExpandColumn: 'disbursementNo', height: 400,
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
                                                             { id: 'disbursementNo', header: 'PRODUCT', width: 20, hidden: false, sortable: true, dataIndex: 'disbursementNo' }
                                                        ], stripeRows: true,
                                                        viewConfig: {
                                                            getRowClass: function (record, rowIndex, rowParams, store) {
                                                                return ((rowIndex % 2) == 0) ? "even-class" : "odd-class";
                                                            }
                                                        },
                                                        listeners: {
                                                            'render': function () {
                                                                getUniqueFinDisbursements(Ext.getCmp('grdFStkIssueRpt'));
                                                            },
                                                            'afterrender': function () {
                                                                setInterval(function () {
                                                                    $('#cboFRptDept').val('');
                                                                    getUniqueFinDisbursements(Ext.getCmp('grdFStkIssueRpt'));
                                                                }, 60000);
                                                            },
                                                            'rowdblclick': function (e, t) {
                                                                var xxdf = [];
                                                                var rrec = e.getStore().getAt(t);
                                                                $.getJSON('/Helper/getDisbursementDetails', { d: rrec.get('disbursementNo') }, function (rs) {
                                                                    if (rs.status.toString() == "true") {
                                                                        $.each(rs.msg, function (i, d) {
                                                                            xxdf[i] = [d.Id, d.product, d.category, d.productCode, d.quantity, d.price, d.resultant, d.branchCode, d.internalAccount];
                                                                        });

                                                                        Ext.getCmp('grdFStkIssueRptDetails').getStore().loadData(xxdf);
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
                                                                $('#cboFRptDept').val('');
                                                                Ext.getCmp('grdFStkIssueRptDetails').getStore().removeAll();
                                                                getUniqueFinDisbursements(Ext.getCmp('grdFStkIssueRpt'));
                                                            }
                                                        }
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        columnWidth: .7, title: 'results panel', height: 650, defaults: { xtype: 'form', frame: true, border: true },
                                        items: [
                                            {
                                                id: '',
                                                items: [
                                                    new Ext.grid.GridPanel({
                                                        id: 'grdFStkIssueRptDetails', title: '', height: 500, autoScroll: true, autoExpandColumn: 'product_name',
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
                                                ],
                                                buttons: [
                                                     {
                                                         tpl: new Ext.XTemplate('<a id="atFRPT" style="display:none" href="{path}">Disbursement Report (xlsx)</a>'), compiled: !0, data: {
                                                             path: "/Notification/DisbursementExcelReport"
                                                         }, autoScroll: !0
                                                     },
                                                    {
                                                        id: '', text: 'Download Csv',
                                                        listeners: {
                                                            'click': function (btn) {
                                                                if (Ext.getCmp('grdFStkIssueRptDetails').getStore().getCount() > 0) {
                                                                    window.open(document.getElementById("atFRPT").href, "_blank")
                                                                }
                                                            }
                                                        }
                                                    }
                                                ]
                                            }
                                        ]
                                    }//END
                                ]
                            },
                            /*
                            {
                                id: '', title: 'STORES RECEIPT VOUCHER'
                            },
                            */
                            {
                                id: '', title: 'STORES TALLY CARD', defaults: { xtype: 'panel', frame: true }, layout: 'column', height: 680,
                                items: [
                                    {
                                        columnWidth: .3, defaults: { xtype: 'form', frame: true, border: true }, height: 650,
                                        items: [
                                            {
                                                id: '', title:'select Product', defaults: { xtype: 'combo', forceSelection: true, typeAhead: true, mode: 'local', anchor: '90%' }, layout: 'fit',
                                                items: [
                                                    {
                                                        id: 'cboTallyProd',emptyText: 'select Product',
                                                        store: new Ext.data.Store({
                                                            autoLoad: true, restful: false,
                                                            url: '/Helper/getProducts',
                                                            reader: new Ext.data.JsonReader({root: 'msg'}, [
                                                                { name: 'Id', type: 'int' },
                                                                { name: 'product_name', type: 'string' }
                                                            ])
                                                        }),valueField: 'Id', displayField: 'product_name'
                                                    }
                                                ]
                                            },
                                            {
                                                id: '', defaults: { xtype: 'datefield', anchor: '90%', format: 'd/m/Y' }, layout: 'fit', title: 'Period From',
                                                items: [
                                                    {id: 'dteTF'}
                                                ]
                                            },
                                            {
                                                id: '', defaults: { xtype: 'datefield', anchor: '90%', format: 'd/m/Y' }, layout: 'fit', title: 'Period To',
                                                items: [
                                                    { id: 'dteTT' }
                                                ],
                                                buttons: [
                                                    {
                                                        id: '', text: 'Fetch Results',
                                                        listeners: {
                                                            'click': function (btn) {
                                                                $.getJSON('/Helper/getTallyCardData', {
                                                                    df: Ext.fly('dteTF').getValue(),
                                                                    dt: Ext.fly('dteTT').getValue(),
                                                                    P: Ext.getCmp('cboTallyProd').getValue()
                                                                }, function (r) {
                                                                    if (r.status.toString() == "true") {
                                                                        var res = [];
                                                                        $.each(r.msg, function (i, d) {
                                                                            res[i] = [d.Id,d.objProduct.product_name,d.quantity,d.price,d.sDte,d.objBranch.branchName,d.currentStock];
                                                                        });

                                                                        console.log(res);
                                                                        Ext.getCmp('grdTally').getStore().removeAll();
                                                                        Ext.getCmp('grdTally').getStore().loadData(res);
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
                                        columnWidth: .7, defaults: { xtype: 'form', frame: true, border: true }, height: 650,
                                        items: [
                                            {
                                                id: '',
                                                items: [
                                                    new Ext.grid.GridPanel({
                                                        id: 'grdTally', title: '', autoScroll: true, autoExpandColumn: 'product_name', height: 600,
                                                        store: new Ext.data.GroupingStore({
                                                            reader: new Ext.data.ArrayReader({}, [
                                                                { name: 'Id', type: 'int' },
                                                                { name: 'product_name', type: 'string' },
                                                                { name: 'quantity', type: 'string' },
                                                                { name: 'price', type: 'string' },
                                                                { name: 'sDte', type: 'string' },
                                                                { name: 'branchName', type: 'string' },
                                                                { name: 'currentStock', type: 'string' }
                                                            ]),
                                                            sortInfo: {
                                                                field: "Id",
                                                                direction: "ASC"
                                                            },
                                                            groupField: "Id"
                                                        }),
                                                        columns: [
                                                             { id: 'Id', header: 'ID', width: 25, hidden: true, sortable: true, dataIndex: 'Id' },
                                                             { id: 'product_name', header: 'PRODUCT', width: 150, hidden: false, sortable: true, dataIndex: 'product_name' },
                                                             { id: 'quantity', header: 'QUANTITY', width: 80, hidden: false, sortable: true, dataIndex: 'quantity' },
                                                             { id: 'price', header: 'PRICE', width: 80, hidden: false, sortable: true, dataIndex: 'price' },
                                                             { id: 'sDte', header: 'DATE', width: 100, hidden: false, sortable: true, dataIndex: 'sDte' },
                                                             { id: 'branchName', header: 'BRANCH', width: 220, hidden: false, sortable: true, dataIndex: 'branchName' },
                                                             { id: 'currentStock', header: 'CURRENT STOCK', width: 100, hidden: false, sortable: true, dataIndex: 'currentStock' },
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
                                                        tpl: new Ext.XTemplate('<a id="aTally" style="display:none" href="{path}">Disbursement Report (xlsx)</a>'), compiled: !0, data: {
                                                            path: "/Notification/getTallyData"
                                                        }
                                                        ,autoScroll: !0
                                                    },
                                                    {
                                                        id: '', text: 'Download Csv',
                                                        listeners: {
                                                            'click': function (btn) {
                                                                if (Ext.getCmp('grdTally').getStore().getCount() > 0) {
                                                                    window.open(document.getElementById("aTally").href, "_blank")
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