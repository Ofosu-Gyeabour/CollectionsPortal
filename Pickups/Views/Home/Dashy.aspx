<%@ Page Title="" Language="C#" MasterPageFile="~/Views/Shared/Dash.Master" Inherits="System.Web.Mvc.ViewPage<dynamic>" %>


<asp:Content ID="Content2" ContentPlaceHolderID="head" runat="server">
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="description" content="Leaf - Bootstrap 4 Admin Template">
    <meta name="author" content="Łukasz Holeczek">
    <meta name="keyword" content="Bootstrap,Admin,Template,Open,Source,AngularJS,Angular,Angular2,jQuery,CSS,HTML,RWD,Dashboard,Vue,Vue.js,React,React.js">
    
    <link href="../../static/css/font-awesome.min.css" rel="stylesheet" />
    <link href="../../static/css/simple-line-icons.css" rel="stylesheet" />
    <link href="../../static/css/style.css" rel="stylesheet" />
    

</asp:Content>

<asp:Content ID="Content1" ContentPlaceHolderID="DesktopBody" runat="server">

    <div class="app-body">
        
        <main class="main">
            
            <div class="container-fluid">
                <div class="animated fadeIn">

                    <div class="card-group">
                        <div class="card">
                            <div class="card-block">
                                <div class="h1 text-muted text-right mb-4">
                                    <i class="icon-people"></i>
                                </div>
                                <div class="h4 routeClass"></div>
                                <small class="text-muted text-uppercase font-weight-bold">ROUTES</small>
                                <div class="progress progress-xs mt-3 mb-0">
                                    <div class="progress-bar bg-info" role="progressbar" style="width: 25%" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div>
                                </div>
                            </div>
                        </div>
                        <div class="card">
                            <div class="card-block">
                                <div class="h1 text-muted text-right mb-4">
                                    <i class="icon-user-follow"></i>
                                </div>
                                <div class="h4 tellers"></div>
                                <small class="text-muted text-uppercase font-weight-bold">Tellers</small>
                                <div class="progress progress-xs mt-3 mb-0">
                                    <div class="progress-bar bg-success" role="progressbar" style="width: 25%" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div>
                                </div>
                            </div>
                        </div>
                        <div class="card">
                            <div class="card-block">
                                <div class="h1 text-muted text-right mb-4">
                                    <i class="icon-basket-loaded"></i>
                                </div>
                                <div class="h4 pickupClients"></div>
                                <small class="text-muted text-uppercase font-weight-bold">Pickup Clients</small>
                                <div class="progress progress-xs mt-3 mb-0">
                                    <div class="progress-bar bg-warning" role="progressbar" style="width: 25%" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div>
                                </div>
                            </div>
                        </div>
                        <div class="card">
                            <div class="card-block">
                                <div class="h1 text-muted text-right mb-4">
                                    <i class="icon-user-follow"></i>
                                </div>
                                <div class="h4 actUsers"></div>
                                <small class="text-muted text-uppercase font-weight-bold">Active Users</small>
                                <div class="progress progress-xs mt-3 mb-0">
                                    <div class="progress-bar" role="progressbar" style="width: 25%" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div>
                                </div>
                            </div>
                        </div>
                        <div class="card">
                            <div class="card-block">
                                <div class="h1 text-muted text-right mb-4">
                                    <i class="icon-user-follow"></i>
                                </div>
                                <div class="h4 loggedUsers"></div>
                                <small class="text-muted text-uppercase font-weight-bold">Logged Users</small>
                                <div class="progress progress-xs mt-3 mb-0">
                                    <div class="progress-bar bg-danger" role="progressbar" style="width: 25%" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="card" id="extform" style="height:550px;margin-top:0px;margin-left:0px;margin-right:0px;margin-bottom:0px;">
                        <script type="text/javascript">
                            Ext.onReady(function () {

                                var getProcessNames = function (ktrl, FLAG, AUTH_FLAG) {
                                    $.getJSON('/Home/getFileNames', { fileFlag: AUTH_FLAG, PROC: FLAG }, function (rs) {
                                        if (rs.status.toString() == "true") {
                                            var ar = [];
                                            $.each(rs.msg, function (i, d) {
                                                ar[i] = [d.Id, d.processName];
                                            });
                                            ktrl.getStore().loadData(ar);
                                        }
                                    });
                                }

                                new Ext.Panel({
                                    renderTo: 'extform', width: 'auto', height: 500, plain: true,
                                    defaults: { xtype: 'panel', height: 480 },
                                    layout: 'accordion',
                                    items: [
                                        {
                                            title: 'Collection Dashboard', defaults: { xtype: 'panel' }, layout: 'form',
                                            items: [
                                                {
                                                    height: 50, defaults: { xtype: 'form', frame: true }, layout: 'fit',
                                                    items: [
                                                        {
                                                            id: '', defaults: { xtype: 'combo', forceSelection: true, typeAhead: true, allowBlank: false, anchor: '90%', mode: 'local' },
                                                            items: [
                                                                {
                                                                    id: 'cboCollection', fieldLabel: 'File',
                                                                    store: new Ext.data.Store({
                                                                        autoLoad: true, restful: true,
                                                                        url: '/Home/getProcessList?PTYP=PICKUPS',
                                                                        reader: new Ext.data.JsonReader({ type: 'json', root: 'msg' }, [
                                                                            { name: 'Id', type: 'int' },
                                                                            { name: 'processName', type: 'string' }
                                                                        ])
                                                                    }), valueField: 'Id', displayField: 'processName',
                                                                    listeners: {
                                                                        'select': function () {
                                                                            $.getJSON('/Dash/getCollectionSummary', { PROC: Ext.fly('cboCollection').getValue() }, function (rs) {
                                                                                if (rs.status.toString() == "true") {
                                                                                    var a = [];
                                                                                    $.each(rs.msg, function (i, d) {
                                                                                        a[i] = [d.Id, d.branchId, d.branchName, d.customerName, d.customerLocation, d.frequency, d.rate, d.amount, d.total, d.BranchApprover, d.HOAuthorizer];
                                                                                    });

                                                                                    Ext.getCmp('grdCollectionReport').getStore().loadData(a);
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
                                                    defaults: { xtype: 'form', frame: true, border: true, height: 290 }, layout: 'fit',
                                                    items: [
                                                        {
                                                            id: '',
                                                            items: [
                                                                new Ext.grid.GridPanel({
                                                                    id: 'grdCollectionReport', title: '', height: 280, autoScroll: true, autoExpandColumn: 'customerName',
                                                                    store: new Ext.data.GroupingStore({
                                                                        reader: new Ext.data.ArrayReader({}, [
                                                                            { name: 'Id', type: 'int' },
                                                                            { name: 'branchId', type: 'string' },
                                                                            { name: 'branchName', type: 'string' },
                                                                            { name: 'customerName', type: 'string' },
                                                                            { name: 'customerLocation', type: 'string' },
                                                                            { name: 'frequency', type: 'string' },
                                                                            { name: 'rate', type: 'string' },
                                                                            { name: 'amount', type: 'string' },
                                                                            { name: 'total', type: 'string' },
                                                                            { name: 'BranchApprover', type: 'string' },
                                                                            { name: 'HOAuthorizer', type: 'string' }
                                                                        ]),
                                                                        sortInfo: {
                                                                            field: "branchId",
                                                                            direction: "ASC"
                                                                        },
                                                                        groupField: "branchId"
                                                                    }),
                                                                    columns: [
                                                                         { id: 'Id', header: 'ID', width: 25, hidden: true, sortable: true, dataIndex: 'Id' },
                                                                         { id: 'branchId', header: 'CODE', width: 80, hidden: false, sortable: true, dataIndex: 'branchId' },
                                                                         { id: 'branchName', header: 'BRANCH', width: 200, hidden: false, sortable: true, dataIndex: 'branchName' },
                                                                         { id: 'customerName', header: 'CUSTOMER', width: 100, hidden: false, sortable: true, dataIndex: 'customerName' },
                                                                         { id: 'customerLocation', header: 'LOCATION', width: 100, hidden: false, sortable: true, dataIndex: 'customerLocation' },
                                                                         { id: 'frequency', header: 'FREQ', width: 100, hidden: false, sortable: true, dataIndex: 'frequency' },
                                                                         { id: 'rate', header: 'RATE', width: 70, hidden: false, sortable: true, dataIndex: 'rate' },
                                                                         { id: 'amount', header: 'AMOUNT', width: 70, hidden: false, sortable: true, dataIndex: 'amount' },
                                                                         { id: 'total', header: 'TOTAL', width: 70, hidden: false, sortable: true, dataIndex: 'total' },
                                                                         { id: 'BranchApprover', header: 'TOTAL', width: 70, hidden: false, sortable: true, dataIndex: 'BranchApprover' },
                                                                         { id: 'HOAuthorizer', header: 'TOTAL', width: 70, hidden: false, sortable: true, dataIndex: 'HOAuthorizer' }
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
                                                                    tpl: new Ext.XTemplate('<a id="atCollPDF" style="display:none" href="{path}">Collection Report (csv)</a>'), compiled: !0, data: {
                                                                        path: "/Dash/CollectionPDFReport"
                                                                    }
                                                                    , autoScroll: !0
                                                                },
                                                                {
                                                                    id: '', text: 'Generate PDF',
                                                                    handler: function (btn) {
                                                                        if (Ext.getCmp('grdCollectionReport').getStore().getCount() > 0) {
                                                                            window.open(document.getElementById("atCollPDF").href, "_blank")
                                                                        }
                                                                    }
                                                                },
                                                                {
                                                                    tpl: new Ext.XTemplate('<a id="atColl" style="display:none" href="{path}">Collection Report (csv)</a>'), compiled: !0, data: {
                                                                        path: "/Dash/CollectionCSvReport"
                                                                    }
                                                                    , autoScroll: !0
                                                                },
                                                                {
                                                                    id: '', text: 'Download CSv',
                                                                    handler: function (btn) {
                                                                        if (Ext.getCmp('grdCollectionReport').getStore().getCount() > 0) {
                                                                            window.open(document.getElementById("atColl").href, "_blank")
                                                                        }
                                                                    }
                                                                },
                                                                {
                                                                    text: 'Clear',
                                                                    handler: function (btn) {
                                                                        Ext.getCmp('grdCollectionReport').getStore().removeAll();
                                                                        $('#cboCollection').val('').focus();
                                                                    }
                                                                }
                                                            ]

                                                        }
                                                    ]
                                                }
                                            ]
                                        },
                                        {
                                            title: 'Specie Dashboard', defaults: { xtype: 'panel' }, layout: 'form',
                                            items: [
                                                {
                                                    height: 50, defaults: { xtype: 'form', frame: true, border: true }, layout: 'fit',
                                                    items: [
                                                        {
                                                            id: 'spekFrm', defaults: { xtype: 'combo', forceSelection: true, typeAhead: true, allowBlank: false, mode: 'local', anchor: '100%' },
                                                            items: [

                                                                {
                                                                    id: 'cboSpekReportFile', fieldLabel: 'Specie File',
                                                                    store: new Ext.data.Store({
                                                                        autoLoad: true, restful: false,
                                                                        url: '/Home/getProcessList?PTYP=SPECIEMOV',
                                                                        reader: new Ext.data.JsonReader({ type: 'json', root: 'msg' }, [
                                                                            { name: 'Id', type: 'int' },
                                                                            { name: 'processName', type: 'string' }
                                                                        ])
                                                                    }), valueField: 'Id', displayField: 'processName',
                                                                    listeners: {
                                                                        'select': function () {
                                                                            $.getJSON('/Dash/getSpecieSummary', { Fn: Ext.fly('cboSpekReportFile').getValue() }, function (rs) {
                                                                                if (rs.status.toString() == "true") {
                                                                                    var spekArr = [];
                                                                                    $.each(rs.msg, function (i, d) {
                                                                                        spekArr[i] = [d.Id, d.branchId, d.branchName, d.routeFrom, d.routeTo, d.Milage, d.Frequency, d.RevenueAccrued, d.BranchApprover, d.HOAuthorizer];
                                                                                    });

                                                                                    Ext.getCmp('grdSPEKReport').getStore().loadData(spekArr);
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
                                                    defaults: { xtype: 'form', frame: true, border: true, height: 260 }, layout: 'fit',
                                                    items: [
                                                        {
                                                            id: '',
                                                            items: [
                                                                new Ext.grid.GridPanel({
                                                                    id: 'grdSPEKReport', title: '', height: 250, autoScroll: true, autoExpandColumn: 'branchId',
                                                                    store: new Ext.data.GroupingStore({
                                                                        reader: new Ext.data.ArrayReader({}, [
                                                                            { name: 'Id', type: 'int' },
                                                                            { name: 'branchId', type: 'string' },
                                                                            { name: 'branchName', type: 'string' },
                                                                            { name: 'routeFrom', type: 'string' },
                                                                            { name: 'routeTo', type: 'string' },
                                                                            { name: 'Milage', type: 'string' },
                                                                            { name: 'Frequency', type: 'string' },
                                                                            { name: 'RevenueAccrued', type: 'string' },
                                                                            { name: 'BranchApprover', type: 'string' },
                                                                            { name: 'HOApprover', type: 'string' }
                                                                        ]),
                                                                        sortInfo: {
                                                                            field: "branchId",
                                                                            direction: "ASC"
                                                                        },
                                                                        groupField: "branchId"
                                                                    }),
                                                                    columns: [
                                                                         { id: 'Id', header: 'ID', width: 25, hidden: true, sortable: true, dataIndex: 'Id' },
                                                                         { id: 'branchId', header: 'CODE', width: 80, hidden: false, sortable: true, dataIndex: 'branchId' },
                                                                         { id: 'branchName', header: 'BRANCH', width: 200, hidden: false, sortable: true, dataIndex: 'branchName' },
                                                                         { id: 'routeFrom', header: 'FROM', width: 100, hidden: false, sortable: true, dataIndex: 'routeFrom' },
                                                                         { id: 'routeTo', header: 'TO', width: 100, hidden: false, sortable: true, dataIndex: 'routeTo' },
                                                                         { id: 'Milage', header: 'MILAGE', width: 100, hidden: false, sortable: true, dataIndex: 'routeTo' },
                                                                         { id: 'Frequency', header: 'FREQUENCY', width: 70, hidden: false, sortable: true, dataIndex: 'Frequency' },
                                                                         { id: 'RevenueAccrued', header: 'REVENUE', width: 70, hidden: false, sortable: true, dataIndex: 'RevenueAccrued' },
                                                                         { id: 'BranchApprover', header: 'BRANCH_APPROVER', width: 70, hidden: false, sortable: true, dataIndex: 'BranchApprover' },
                                                                         { id: 'HOApprover', header: 'H/O AUTHORIZER', width: 70, hidden: false, sortable: true, dataIndex: 'HOApprover' }
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
                                                                    tpl: new Ext.XTemplate('<a id="atSPEKCPDF" style="display:none" href="{path}">DHL Summary Report (csv)</a>'), compiled: !0, data: {
                                                                        path: "/Dash/SpecieSummaryDetails"
                                                                    }
                                                                    , autoScroll: !0
                                                                },
                                                                {
                                                                    id: '', text: 'Generate PDF',
                                                                    handler: function (btn) {
                                                                        if (Ext.getCmp('grdSPEKReport').getStore().getCount() > 0) {
                                                                            window.open(document.getElementById("atSPEKCPDF").href, "_blank")
                                                                        }
                                                                    }
                                                                },
                                                                {
                                                                    tpl: new Ext.XTemplate('<a id="atSPEKCSv" style="display:none" href="{path}">DHL Summary Report (csv)</a>'), compiled: !0, data: {
                                                                        path: "/Dash/SPEKSummaryCSvReport"
                                                                    }
                                                                    , autoScroll: !0
                                                                },
                                                                {
                                                                    id: '', text: 'Download CSv',
                                                                    handler: function (btn) {
                                                                        if (Ext.getCmp('grdSPEKReport').getStore().getCount() > 0) {
                                                                            window.open(document.getElementById("atSPEKCSv").href, "_blank")
                                                                        }
                                                                    }
                                                                },
                                                                {
                                                                    text: 'Clear',
                                                                    handler: function (btn) {
                                                                        Ext.getCmp('grdSPEKReport').getStore().removeAll();
                                                                        $('#cboSpekReportFile').val('').focus();
                                                                    }
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                }
                                            ]
                                        },
                                        {
                                            title: 'Teller Dashboard', defaults: { xtype: 'panel' }, layout: 'form',
                                            items: [
                                                {
                                                    height: 50, defaults: { xtype: 'form', frame: true, border: true }, layout: 'fit',
                                                    items: [
                                                        {
                                                            id: 'frmTellerQuery', defaults: { xtype: 'combo', forceSelection: true, typeAhead: true, allowBlank: false, mode: 'local', anchor: '100%' },
                                                            items: [
                                                                {
                                                                    id: 'cboTellerQuery', fieldLabel: 'Teller File',
                                                                    store: new Ext.data.Store({
                                                                        autoLoad: true, restful: false,
                                                                        url: '/Home/getProcessList?PTYP=TELLR',
                                                                        reader: new Ext.data.JsonReader({ type: 'json', root: 'msg' }, [
                                                                            { name: 'Id', type: 'int' },
                                                                            { name: 'processName', type: 'string' }
                                                                        ])
                                                                    }), valueField: 'Id', displayField: 'processName',
                                                                    listeners: {
                                                                        'select': function () {
                                                                            $.getJSON('/Dash/getTellerSummary', { Fn: Ext.fly('cboTellerQuery').getValue() }, function (rs) {
                                                                                if (rs.status.toString() == "true") {
                                                                                    var tellerDta = [];
                                                                                    $.each(rs.msg, function (i, d) {
                                                                                        tellerDta[i] = [d.Id, d.branchId, d.branchName, d.Location, d.rate, d.Amount, d.Branch_Approver, d.HO_Authorizer];
                                                                                    });

                                                                                    Ext.getCmp('grdTELLRReport').getStore().removeAll();
                                                                                    Ext.getCmp('grdTELLRReport').getStore().loadData(tellerDta);
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
                                                    defaults: { xtype: 'form', frame: true, border: true, height: 260 }, layout: 'fit',
                                                    items: [
                                                        {
                                                            id: '', //columnWidth: .6,
                                                            items: [
                                                                new Ext.grid.GridPanel({
                                                                    id: 'grdTELLRReport', title: '', height: 250, autoScroll: true, autoExpandColumn: 'Location',
                                                                    store: new Ext.data.GroupingStore({
                                                                        reader: new Ext.data.ArrayReader({}, [
                                                                            { name: 'Id', type: 'int' },
                                                                            { name: 'branchId', type: 'string' },
                                                                            { name: 'branchName', type: 'string' },
                                                                            { name: 'Location', type: 'string' },
                                                                            { name: 'rate', type: 'string' },
                                                                            { name: 'Amount', type: 'string' },
                                                                            { name: 'Branch_Approver', type: 'string' },
                                                                            { name: 'HO_Authorizer', type: 'string' }
                                                                        ]),
                                                                        sortInfo: {
                                                                            field: "branchId",
                                                                            direction: "ASC"
                                                                        },
                                                                        groupField: "branchId"
                                                                    }),
                                                                    columns: [
                                                                         { id: 'Id', header: 'ID', width: 25, hidden: true, sortable: true, dataIndex: 'Id' },
                                                                         { id: 'branchId', header: 'CODE', width: 80, hidden: false, sortable: true, dataIndex: 'branchId' },
                                                                         { id: 'branchName', header: 'BRANCH', width: 200, hidden: false, sortable: true, dataIndex: 'branchName' },
                                                                         { id: 'Location', header: 'LOCATION', width: 100, hidden: false, sortable: true, dataIndex: 'Location' },
                                                                         { id: 'rate', header: 'RATE', width: 100, hidden: false, sortable: true, dataIndex: 'rate' },
                                                                         { id: 'Amount', header: 'AMOUNT', width: 100, hidden: false, sortable: true, dataIndex: 'Amount' },
                                                                         { id: 'Branch_Approver', header: 'APPROVER', width: 70, hidden: false, sortable: true, dataIndex: 'Branch_Approver' },
                                                                         { id: 'HO_Authorizer', header: 'AUTHORIZER', width: 70, hidden: false, sortable: true, dataIndex: 'HO_Authorizer' }
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
                                                                    tpl: new Ext.XTemplate('<a id="atTELLRPDF" style="display:none" href="{path}">DHL Summary Report (csv)</a>'), compiled: !0, data: {
                                                                        path: "/Dash/TellerSummaryDetails"
                                                                    }
                                                                    , autoScroll: !0
                                                                },
                                                                {
                                                                    id: '', text: 'Generate PDF',
                                                                    handler: function (btn) {
                                                                        if (Ext.getCmp('grdTELLRReport').getStore().getCount() > 0) {
                                                                            window.open(document.getElementById("atTELLRPDF").href, "_blank")
                                                                        }
                                                                    }
                                                                },
                                                                {
                                                                    tpl: new Ext.XTemplate('<a id="atTELLRCSv" style="display:none" href="{path}">DHL Summary Report (csv)</a>'), compiled: !0, data: {
                                                                        path: "/Dash/TellerSummaryCSvReport"
                                                                    }
                                                                    , autoScroll: !0
                                                                },
                                                                {
                                                                    id: '', text: 'Download CSv',
                                                                    handler: function (btn) {
                                                                        if (Ext.getCmp('grdTELLRReport').getStore().getCount() > 0) {
                                                                            window.open(document.getElementById("atTELLRCSv").href, "_blank")
                                                                        }
                                                                    }
                                                                },
                                                                {
                                                                    text: 'Clear',
                                                                    handler: function (btn) {
                                                                        Ext.getCmp('grdTELLRReport').getStore().removeAll();
                                                                        $('#cboTellerQuery').val('').focus();
                                                                    }
                                                                }
                                                            ]
                                                        }
                                                        //,{ id: '', columnWidth: .4 }
                                                    ]
                                                }
                                            ]
                                        },
                                        {
                                            title: 'Fedex Dashboard', defaults: { xtype: 'panel' }, layout: 'form',
                                            items: [
                                                {
                                                    height: 50, defaults: { xtype: 'form', frame: true }, layout: 'column',
                                                    items: [
                                                        {
                                                            id: 'fedFrm', title: 'Date From', columnWidth: .3, allowBlank: false, defaults: { xtype: 'datefield', format: 'd/m/Y', anchor: '100%' }, layout: 'fit',
                                                            items: [
                                                                { id: 'fdhldf' }
                                                            ]
                                                        },
                                                        {
                                                            id: 'fedTFrm', title: 'Date To', columnWidth: .3, allowBlank: false, defaults: { xtype: 'datefield', format: 'd/m/Y', anchor: '100%' }, layout: 'fit',
                                                            items: [
                                                                { id: 'fdhldt' }
                                                            ]
                                                        },
                                                        {
                                                            id: 'fedcbo', title: 'Filter', columnWidth: .3, allowBlank: false, defaults: { xtype: 'combo', forceSelection: true, typeAhead: true, mode: 'local', allowBlank: false, anchor: '100%' }, layout: 'fit',
                                                            items: [
                                                                { id: 'fedexcbostatus', store: ['Branch Approved', 'H/O Authorized'] }
                                                            ]
                                                        },
                                                        {
                                                            title: 'Action', columnWidth: .1, defaults: { xtype: 'button', anchor: '100%' }, layout: 'fit',
                                                            items: [
                                                                {
                                                                    id: '', text: 'Fetch',
                                                                    listeners: {
                                                                        'click': function (btn) {
                                                                            var df = Ext.getCmp('fedFrm').getForm();
                                                                            var dt = Ext.getCmp('fedTFrm').getForm();
                                                                            var dcbo = Ext.getCmp('fedcbo').getForm();

                                                                            if (df.isValid() && dt.isValid() && dcbo.isValid()) {

                                                                                Ext.getCmp('grdFEDEXReport').getEl().mask('Fetching data..Please wait');
                                                                                $.getJSON('/Dash/getCourierSummary', {
                                                                                    dF: Ext.fly('fdhldf').getValue(), dT: Ext.fly('fdhldt').getValue(),
                                                                                    statusType: Ext.fly('fedexcbostatus').getValue(), courierType: 'FEDEX'
                                                                                }, function (rs) {
                                                                                    if (rs.status.toString() == "true") {
                                                                                        var a = [];
                                                                                        $.each(rs.msg, function (i, d) {
                                                                                            a[i] = [d.Id, d.branchId, d.branchName, d.charge, d.discount, d.subTotal, d.VAT, d.NHIL, d.Insurance, d.netAmount, d.amountDue];
                                                                                        });

                                                                                        console.log(a);
                                                                                        Ext.getCmp('grdFEDEXReport').getEl().unmask();
                                                                                        Ext.getCmp('grdFEDEXReport').getStore().loadData(a);
                                                                                    }
                                                                                });
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                },
                                                {
                                                    title: 'Chart', height: 280, defaults: { xtype: 'form', frame: true, border: true }, layout: 'form',
                                                    items: [
                                                        {
                                                            id: '',
                                                            items: [
                                                                new Ext.grid.GridPanel({
                                                                    id: 'grdFEDEXReport', title: '', height: 230, autoScroll: true, autoExpandColumn: 'branchId',
                                                                    store: new Ext.data.GroupingStore({
                                                                        reader: new Ext.data.ArrayReader({}, [
                                                                            { name: 'Id', type: 'int' },
                                                                            { name: 'branchId', type: 'string' },
                                                                            { name: 'branchName', type: 'string' },
                                                                            { name: 'charge', type: 'string' },
                                                                            { name: 'discount', type: 'string' },
                                                                            { name: 'subTotal', type: 'string' },
                                                                            { name: 'VAT', type: 'string' },
                                                                            { name: 'NHIL', type: 'string' },
                                                                            { name: 'Insurance', type: 'string' },
                                                                            { name: 'netAmount', type: 'string' },
                                                                            { name: 'amountDue', type: 'string' },
                                                                        ]),
                                                                        sortInfo: {
                                                                            field: "branchId",
                                                                            direction: "ASC"
                                                                        },
                                                                        groupField: "branchId"
                                                                    }),
                                                                    columns: [
                                                                         { id: 'Id', header: 'ID', width: 25, hidden: true, sortable: true, dataIndex: 'Id' },
                                                                         { id: 'branchId', header: 'CODE', width: 80, hidden: false, sortable: true, dataIndex: 'branchId' },
                                                                         { id: 'branchName', header: 'BRANCH', width: 200, hidden: false, sortable: true, dataIndex: 'branchName' },
                                                                         { id: 'charge', header: 'CHARGE', width: 100, hidden: false, sortable: true, dataIndex: 'charge' },
                                                                         { id: 'discount', header: 'DISCOUNT', width: 100, hidden: false, sortable: true, dataIndex: 'discount' },
                                                                         { id: 'subTotal', header: 'SUB-TOTAL', width: 100, hidden: false, sortable: true, dataIndex: 'subTotal' },
                                                                         { id: 'VAT', header: 'VAT', width: 70, hidden: false, sortable: true, dataIndex: 'VAT' },
                                                                         { id: 'NHIL', header: 'NHIL', width: 70, hidden: false, sortable: true, dataIndex: 'NHIL' },
                                                                         { id: 'Insurance', header: 'INSURANCE', width: 70, hidden: false, sortable: true, dataIndex: 'Insurance' },
                                                                         { id: 'netAmount', header: 'NET-AMOUNT', width: 70, hidden: false, sortable: true, dataIndex: 'netAmount' },
                                                                         { id: 'amountDue', header: 'TOTAL-AMOUNT', width: 70, hidden: false, sortable: true, dataIndex: 'amountDue' },
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
                                                                    tpl: new Ext.XTemplate('<a id="atRPTPDF" style="display:none" href="{path}">DHL Summary Report (csv)</a>'), compiled: !0, data: {
                                                                        path: "/Dash/DHLSummaryPDFReport"
                                                                    }
                                                                    , autoScroll: !0
                                                                },
                                                                {
                                                                    id: '', text: 'Generate PDF',
                                                                    handler: function (btn) {
                                                                        if (Ext.getCmp('grdFEDEXReport').getStore().getCount() > 0) {
                                                                            window.open(document.getElementById("atRPTPDF").href, "_blank")
                                                                        }
                                                                    }
                                                                },
                                                                {
                                                                    tpl: new Ext.XTemplate('<a id="atRPTT" style="display:none" href="{path}">DHL Summary Report (csv)</a>'), compiled: !0, data: {
                                                                        path: "/Dash/DHLSummaryCSvReport"
                                                                    }
                                                                    , autoScroll: !0
                                                                },
                                                                {
                                                                    id: '', text: 'Download CSv',
                                                                    handler: function (btn) {
                                                                        if (Ext.getCmp('grdFEDEXReport').getStore().getCount() > 0) {
                                                                            window.open(document.getElementById("atRPTT").href, "_blank")
                                                                        }
                                                                    }
                                                                },
                                                                {
                                                                    text: 'Clear',
                                                                    handler: function () {
                                                                        $('#fdhldt').val('');
                                                                        $('#fedexcbostatus').val('');
                                                                        Ext.getCmp('grdFEDEXReport').getStore().removeAll();
                                                                        $('#fdhldf').val('').focus();
                                                                    }
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                }
                                            ]
                                        },
                                        {
                                            title: 'DHL Dashboard', defaults: { xtype: 'panel' }, layout: 'form',
                                            items: [
                                                {
                                                    height: 50, defaults: { xtype: 'form', frame: true }, layout: 'column',
                                                    items: [
                                                        {
                                                            id: 'dFrm', title: 'Date From', columnWidth: .3, allowBlank: false, defaults: { xtype: 'datefield', format: 'd/m/Y', anchor: '100%' }, layout: 'fit',
                                                            items: [
                                                                { id: 'dhldf' }
                                                            ]
                                                        },
                                                        {
                                                            id: 'dTFrm', title: 'Date To', columnWidth: .3, allowBlank: false, defaults: { xtype: 'datefield', format: 'd/m/Y', anchor: '100%' }, layout: 'fit',
                                                            items: [
                                                                { id: 'dhldt' }
                                                            ]
                                                        },
                                                        {
                                                            id: 'dcbo', title: 'Filter', columnWidth: .3, allowBlank: false, defaults: { xtype: 'combo', forceSelection: true, typeAhead: true, mode: 'local', allowBlank: false, anchor: '100%' }, layout: 'fit',
                                                            items: [
                                                                { id: 'dhlcbostatus', store: ['Branch Approved', 'H/O Authorized'] }
                                                            ]
                                                        },
                                                        {
                                                            title: 'Action', columnWidth: .1, defaults: { xtype: 'button', anchor: '100%' }, layout: 'fit',
                                                            items: [
                                                                {
                                                                    id: '', text: 'Fetch',
                                                                    listeners: {
                                                                        'click': function (btn) {
                                                                            var df = Ext.getCmp('dFrm').getForm();
                                                                            var dt = Ext.getCmp('dTFrm').getForm();
                                                                            var dcbo = Ext.getCmp('dcbo').getForm();

                                                                            if (df.isValid() && dt.isValid() && dcbo.isValid()) {

                                                                                Ext.getCmp('grdDHLReport').getEl().mask('Fetching data..Please wait');
                                                                                $.getJSON('/Dash/getCourierSummary', {
                                                                                    dF: Ext.fly('dhldf').getValue(), dT: Ext.fly('dhldt').getValue(),
                                                                                    statusType: Ext.fly('dhlcbostatus').getValue(), courierType: 'DHL'
                                                                                }, function (rs) {
                                                                                    if (rs.status.toString() == "true") {
                                                                                        var a = [];
                                                                                        $.each(rs.msg, function (i, d) {
                                                                                            a[i] = [d.Id, d.branchId, d.branchName, d.charge, d.discount, d.subTotal, d.VAT, d.NHIL, d.Insurance, d.netAmount, d.amountDue];
                                                                                        });

                                                                                        Ext.getCmp('grdDHLReport').getEl().unmask();
                                                                                        Ext.getCmp('grdDHLReport').getStore().loadData(a);
                                                                                    }
                                                                                });
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                },
                                                {
                                                    height: 280, defaults: { xtype: 'form', frame: true, border: true }, layout: 'form',
                                                    items: [
                                                        {
                                                            id: '',
                                                            items: [
                                                                new Ext.grid.GridPanel({
                                                                    id: 'grdDHLReport', title: '', height: 230, autoScroll: true, autoExpandColumn: 'branchId',
                                                                    store: new Ext.data.GroupingStore({
                                                                        reader: new Ext.data.ArrayReader({}, [
                                                                            { name: 'Id', type: 'int' },
                                                                            { name: 'branchId', type: 'string' },
                                                                            { name: 'branchName', type: 'string' },
                                                                            { name: 'charge', type: 'string' },
                                                                            { name: 'discount', type: 'string' },
                                                                            { name: 'subTotal', type: 'string' },
                                                                            { name: 'VAT', type: 'string' },
                                                                            { name: 'NHIL', type: 'string' },
                                                                            { name: 'Insurance', type: 'string' },
                                                                            { name: 'netAmount', type: 'string' },
                                                                            { name: 'amountDue', type: 'string' },
                                                                        ]),
                                                                        sortInfo: {
                                                                            field: "branchId",
                                                                            direction: "ASC"
                                                                        },
                                                                        groupField: "branchId"
                                                                    }),
                                                                    columns: [
                                                                         { id: 'Id', header: 'ID', width: 25, hidden: true, sortable: true, dataIndex: 'Id' },
                                                                         { id: 'branchId', header: 'CODE', width: 80, hidden: false, sortable: true, dataIndex: 'branchId' },
                                                                         { id: 'branchName', header: 'BRANCH', width: 200, hidden: false, sortable: true, dataIndex: 'branchName' },
                                                                         { id: 'charge', header: 'CHARGE', width: 100, hidden: false, sortable: true, dataIndex: 'charge' },
                                                                         { id: 'discount', header: 'DISCOUNT', width: 100, hidden: false, sortable: true, dataIndex: 'discount' },
                                                                         { id: 'subTotal', header: 'SUB-TOTAL', width: 100, hidden: false, sortable: true, dataIndex: 'subTotal' },
                                                                         { id: 'VAT', header: 'VAT', width: 70, hidden: false, sortable: true, dataIndex: 'VAT' },
                                                                         { id: 'NHIL', header: 'NHIL', width: 70, hidden: false, sortable: true, dataIndex: 'NHIL' },
                                                                         { id: 'Insurance', header: 'INSURANCE', width: 70, hidden: false, sortable: true, dataIndex: 'Insurance' },
                                                                         { id: 'netAmount', header: 'NET-AMOUNT', width: 70, hidden: false, sortable: true, dataIndex: 'netAmount' },
                                                                         { id: 'amountDue', header: 'TOTAL-AMOUNT', width: 70, hidden: false, sortable: true, dataIndex: 'amountDue' },
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
                                                                    tpl: new Ext.XTemplate('<a id="atDHLPDF" style="display:none" href="{path}">DHL Summary Report (csv)</a>'), compiled: !0, data: {
                                                                        path: "/Dash/DHLDataSummaryPDFReport"
                                                                    }
                                                                    , autoScroll: !0
                                                                },
                                                                {
                                                                    id: '', text: 'Generate PDF',
                                                                    handler: function (btn) {
                                                                        if (Ext.getCmp('grdDHLReport').getStore().getCount() > 0) {
                                                                            window.open(document.getElementById("atDHLPDF").href, "_blank")
                                                                        }
                                                                    }
                                                                },
                                                                {
                                                                    tpl: new Ext.XTemplate('<a id="atRPT" style="display:none" href="{path}">DHL Summary Report (csv)</a>'), compiled: !0, data: {
                                                                        path: "/Dash/DHLSummaryCSvReport"
                                                                    }
                                                                    , autoScroll: !0
                                                                },
                                                                {
                                                                    id: '', text: 'Download CSv',
                                                                    handler: function (btn) {
                                                                        if (Ext.getCmp('grdDHLReport').getStore().getCount() > 0) {
                                                                            window.open(document.getElementById("atRPT").href, "_blank")
                                                                        }
                                                                    }
                                                                },
                                                                {
                                                                    text: 'Clear',
                                                                    handler: function (btn) {
                                                                        Ext.getCmp('grdDHLReport').getStore().removeAll();
                                                                        $('dhldt').val('');
                                                                        $('dhlcbostatus').val('');
                                                                        $('dhldf').val('').focus();
                                                                    }
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                }
                                            ]
                                        },
                                        {
                                            title: 'IAS Dashboard', defaults: { xtype: 'panel' }, layout: 'form',
                                            items: [
                                                {
                                                    height: 50, defaults: { xtype: 'form', frame: true }, layout: 'column',
                                                    items: [
                                                        {
                                                            id: 'dxFrm', title: 'Date From', columnWidth: .3, allowBlank: false, defaults: { xtype: 'datefield', format: 'd/m/Y', anchor: '100%' }, layout: 'fit',
                                                            items: [
                                                                { id: 'iasdf' }
                                                            ]
                                                        },
                                                        {
                                                            id: 'dTxFrm', title: 'Date To', columnWidth: .3, allowBlank: false, defaults: { xtype: 'datefield', format: 'd/m/Y', anchor: '100%' }, layout: 'fit',
                                                            items: [
                                                                { id: 'iasdt' }
                                                            ]
                                                        },
                                                        {
                                                            id: 'dxcbo', title: 'Filter', columnWidth: .3, allowBlank: false, defaults: { xtype: 'combo', forceSelection: true, typeAhead: true, mode: 'local', allowBlank: false, anchor: '100%' }, layout: 'fit',
                                                            items: [
                                                                { id: 'iascbostatus', store: ['Branch Approved', 'H/O Authorized'] }
                                                            ]
                                                        },
                                                        {
                                                            title: 'Action', columnWidth: .1, defaults: { xtype: 'button', anchor: '100%' }, layout: 'fit',
                                                            items: [
                                                                {
                                                                    id: '', text: 'Fetch',
                                                                    listeners: {
                                                                        'click': function (btn) {
                                                                            var df = Ext.getCmp('dxFrm').getForm();
                                                                            var dt = Ext.getCmp('dTxFrm').getForm();
                                                                            var dcbo = Ext.getCmp('dxcbo').getForm();

                                                                            if (df.isValid() && dt.isValid() && dcbo.isValid()) {

                                                                                Ext.getCmp('grdIASReport').getEl().mask('Fetching data..Please wait');
                                                                                $.getJSON('/Dash/getCourierSummary', {
                                                                                    dF: Ext.fly('iasdf').getValue(), dT: Ext.fly('iasdt').getValue(),
                                                                                    statusType: Ext.fly('iascbostatus').getValue(), courierType: 'IAS'
                                                                                }, function (rs) {
                                                                                    if (rs.status.toString() == "true") {
                                                                                        var a = [];
                                                                                        $.each(rs.msg, function (i, d) {
                                                                                            a[i] = [d.Id, d.branchId, d.branchName, d.charge, d.discount, d.subTotal, d.VAT, d.NHIL, d.Insurance, d.netAmount, d.amountDue];
                                                                                        });

                                                                                        Ext.getCmp('grdIASReport').getEl().unmask();
                                                                                        Ext.getCmp('grdIASReport').getStore().loadData(a);
                                                                                    }
                                                                                });
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                },

                                                {
                                                    height: 280, defaults: { xtype: 'form', frame: true, border: true }, layout: 'form',
                                                    items: [
                                                        {
                                                            id: '',
                                                            items: [
                                                                new Ext.grid.GridPanel({
                                                                    id: 'grdIASReport', title: '', height: 230, autoScroll: true, autoExpandColumn: 'branchId',
                                                                    store: new Ext.data.GroupingStore({
                                                                        reader: new Ext.data.ArrayReader({}, [
                                                                            { name: 'Id', type: 'int' },
                                                                            { name: 'branchId', type: 'string' },
                                                                            { name: 'branchName', type: 'string' },
                                                                            { name: 'charge', type: 'string' },
                                                                            { name: 'discount', type: 'string' },
                                                                            { name: 'subTotal', type: 'string' },
                                                                            { name: 'VAT', type: 'string' },
                                                                            { name: 'NHIL', type: 'string' },
                                                                            { name: 'Insurance', type: 'string' },
                                                                            { name: 'netAmount', type: 'string' },
                                                                            { name: 'amountDue', type: 'string' },
                                                                        ]),
                                                                        sortInfo: {
                                                                            field: "branchId",
                                                                            direction: "ASC"
                                                                        },
                                                                        groupField: "branchId"
                                                                    }),
                                                                    columns: [
                                                                         { id: 'Id', header: 'ID', width: 25, hidden: true, sortable: true, dataIndex: 'Id' },
                                                                         { id: 'branchId', header: 'CODE', width: 80, hidden: false, sortable: true, dataIndex: 'branchId' },
                                                                         { id: 'branchName', header: 'BRANCH', width: 200, hidden: false, sortable: true, dataIndex: 'branchName' },
                                                                         { id: 'charge', header: 'CHARGE', width: 100, hidden: false, sortable: true, dataIndex: 'charge' },
                                                                         { id: 'discount', header: 'DISCOUNT', width: 100, hidden: false, sortable: true, dataIndex: 'discount' },
                                                                         { id: 'subTotal', header: 'SUB-TOTAL', width: 100, hidden: false, sortable: true, dataIndex: 'subTotal' },
                                                                         { id: 'VAT', header: 'VAT', width: 70, hidden: false, sortable: true, dataIndex: 'VAT' },
                                                                         { id: 'NHIL', header: 'NHIL', width: 70, hidden: false, sortable: true, dataIndex: 'NHIL' },
                                                                         { id: 'Insurance', header: 'INSURANCE', width: 70, hidden: false, sortable: true, dataIndex: 'Insurance' },
                                                                         { id: 'netAmount', header: 'NET-AMOUNT', width: 70, hidden: false, sortable: true, dataIndex: 'netAmount' },
                                                                         { id: 'amountDue', header: 'TOTAL-AMOUNT', width: 70, hidden: false, sortable: true, dataIndex: 'amountDue' },
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
                                                                    tpl: new Ext.XTemplate('<a id="atIASPDF" style="display:none" href="{path}">DHL Summary Report (csv)</a>'), compiled: !0, data: {
                                                                        path: "/Dash/DHLSummaryPDFReport"
                                                                    }
                                                                    , autoScroll: !0
                                                                },
                                                                {
                                                                    id: '', text: 'Generate PDF',
                                                                    handler: function (btn) {
                                                                        if (Ext.getCmp('grdIASReport').getStore().getCount() > 0) {
                                                                            window.open(document.getElementById("atIASPDF").href, "_blank")
                                                                        }
                                                                    }
                                                                },
                                                                {
                                                                    tpl: new Ext.XTemplate('<a id="atIASRPT" style="display:none" href="{path}">DHL Summary Report (csv)</a>'), compiled: !0, data: {
                                                                        path: "/Dash/DHLSummaryCSvReport"
                                                                    }
                                                                    , autoScroll: !0
                                                                },
                                                                {
                                                                    id: '', text: 'Download CSv',
                                                                    handler: function (btn) {
                                                                        if (Ext.getCmp('grdIASReport').getStore().getCount() > 0) {
                                                                            window.open(document.getElementById("atIASRPT").href, "_blank")
                                                                        }
                                                                    }
                                                                },
                                                                {
                                                                    text: 'Clear',
                                                                    handler: function (btn) {
                                                                        Ext.getCmp('grdIASReport').getStore().removeAll();
                                                                        $('iasdt').val('');
                                                                        $('iascbostatus').val('');
                                                                        $('iasdf').val('').focus();
                                                                    }
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                }

                                            ]
                                        },

                                        {
                                            title: 'CheckPoint', defaults: { xtype: 'panel' }, layout: 'form',
                                            items: [
                                                {
                                                    height: 50, defaults: { xtype: 'form', frame: true }, layout: 'column',
                                                    items: [
                                                        {
                                                            id: 'chkFrm', title: 'Date From', columnWidth: .3, allowBlank: false, defaults: { xtype: 'datefield', format: 'd/m/Y', anchor: '100%' }, layout: 'fit',
                                                            items: [
                                                                { id: 'chkdf' }
                                                            ]
                                                        },
                                                        {
                                                            id: 'chkTxFrm', title: 'Date To', columnWidth: .3, allowBlank: false, defaults: { xtype: 'datefield', format: 'd/m/Y', anchor: '100%' }, layout: 'fit',
                                                            items: [
                                                                { id: 'chkdt' }
                                                            ]
                                                        },
                                                        {
                                                            id: 'chkxcbo', title: 'Filter', columnWidth: .3, allowBlank: false, defaults: { xtype: 'combo', forceSelection: true, typeAhead: true, mode: 'local', allowBlank: false, anchor: '100%' }, layout: 'fit',
                                                            items: [
                                                                { id: 'chkcbostatus', store: ['Loaded', 'Branch Approved', 'Retail Authorized'] }
                                                            ]
                                                        },
                                                        {
                                                            title: 'Action', columnWidth: .1, defaults: { xtype: 'button', anchor: '100%' }, layout: 'fit',
                                                            items: [
                                                                {
                                                                    id: 'chkFetch', text: 'Fetch',
                                                                    listeners: {
                                                                        'click': function (btn) {
                                                                            var df = Ext.getCmp('chkFrm').getForm();
                                                                            var dt = Ext.getCmp('chkTxFrm').getForm();
                                                                            var dcbo = Ext.getCmp('chkxcbo').getForm();

                                                                            if (df.isValid() && dt.isValid() && dcbo.isValid()) {

                                                                                Ext.getCmp('grdCHKReport').getEl().mask('Fetching data..Please wait');
                                                                                $.getJSON('/Dash/getCheckPointSummary', {
                                                                                    dF: Ext.fly('chkdf').getValue(), dT: Ext.fly('chkdt').getValue(),
                                                                                    statusType: Ext.fly('chkcbostatus').getValue(), fileName: 'CHKP/8/2019'
                                                                                }, function (rs) {
                                                                                    if (rs.status.toString() == "true") {
                                                                                        var a = [];
                                                                                        $.each(rs.msg, function (i, d) {
                                                                                            a[i] = [d.Id, d.CompanyCode, d.CompanyName, d.currencyId, d.currencySymbol,d.BookCode, d.BookType, d.BookCount.toString()];
                                                                                        });

                                                                                        Ext.getCmp('grdCHKReport').getEl().unmask();
                                                                                        Ext.getCmp('grdCHKReport').getStore().loadData(a);
                                                                                    }
                                                                                });
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                },

                                                //grid
                                                {
                                                    height: 280, defaults: { xtype: 'form', frame: true, border: true }, layout: 'form',
                                                    items: [
                                                        {
                                                            id: '',
                                                            items: [
                                                                new Ext.grid.GridPanel({
                                                                    id: 'grdCHKReport', title: '', height: 230, autoScroll: true, autoExpandColumn: 'CompanyCode',
                                                                    store: new Ext.data.GroupingStore({
                                                                        reader: new Ext.data.ArrayReader({}, [
                                                                            { name: 'Id', type: 'int' },
                                                                            { name: 'CompanyCode', type: 'string' },
                                                                            { name: 'CompanyName', type: 'string' },
                                                                            { name: 'currencyId', type: 'string' },
                                                                            { name: 'currencySymbol', type: 'string' },
                                                                            { name: 'BookCode', type: 'string'},
                                                                            { name: 'BookType', type: 'string' },
                                                                            { name: 'BookCount', type: 'string' }
                                                                        ]),
                                                                        sortInfo: {
                                                                            field: "CompanyName",
                                                                            direction: "ASC"
                                                                        },
                                                                        groupField: "CompanyName"
                                                                    }),
                                                                    columns: [
                                                                         { id: 'Id', header: 'ID', width: 25, hidden: true, sortable: true, dataIndex: 'Id' },
                                                                         { id: 'CompanyCode', header: 'CODE', width: 80, hidden: false, sortable: true, dataIndex: 'CompanyCode' },
                                                                         { id: 'CompanyName', header: 'BRANCH', width: 200, hidden: false, sortable: true, dataIndex: 'CompanyName' },
                                                                         { id: 'currencyId', header: 'CURRENCY_ID', width: 100, hidden: true, sortable: true, dataIndex: 'currencyId' },
                                                                         { id: 'currencySymbol', header: 'SYMBOL', width: 80, hidden: false, sortable: true, dataIndex: 'currencySymbol' },
                                                                         { id: 'BookCode', header: 'BOOKCODE', width: 100, hidden: false, sortable: true, dataIndex: 'BookCode' },
                                                                         { id: 'BookType', header: 'BOOKTYPE', width: 150, hidden: false, sortable: true, dataIndex: 'BookType' },
                                                                         { id: 'BookCount', header: 'TOTAL', width: 70, hidden: false, sortable: true, dataIndex: 'BookCount' }
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
                                                                    tpl: new Ext.XTemplate('<a id="atCHKPDF" style="display:none" href="{path}">DHL Summary Report (pdf)</a>'), compiled: !0, data: {
                                                                        path: "/Dash/CHECKPointPDFReport"
                                                                    }
                                                                    , autoScroll: !0
                                                                },
                                                                {
                                                                    id: '', text: 'Generate chk PDF',
                                                                    handler: function (btn) {
                                                                        if (Ext.getCmp('grdCHKReport').getStore().getCount() > 0) {
                                                                            window.open(document.getElementById("atCHKPDF").href, "_blank")
                                                                        }
                                                                    }
                                                                },
                                                                {
                                                                    tpl: new Ext.XTemplate('<a id="atCHKRPT" style="display:none" href="{path}">DHL Summary Report (csv)</a>'), compiled: !0, data: {
                                                                        path: "/Dash/CHECKPointCSVReport"
                                                                    }
                                                                    , autoScroll: !0
                                                                },
                                                                {
                                                                    id: '', text: 'Download CSv',
                                                                    handler: function (btn) {
                                                                        if (Ext.getCmp('grdCHKReport').getStore().getCount() > 0) {
                                                                            window.open(document.getElementById("atCHKRPT").href, "_blank")
                                                                        }
                                                                    }
                                                                },
                                                                {
                                                                    text: 'Clear',
                                                                    handler: function (btn) {
                                                                        Ext.getCmp('grdCHKReport').getStore().removeAll();
                                                                        $('chkdt').val('');
                                                                        $('chkcbostatus').val('');
                                                                        $('chkdf').val('').focus();
                                                                    }
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                }

                                            ]
                                        }
                                    ]
                                });
                            });
                        </script>
                    </div>

                    <div class="row">
                        <div class="col-md-12">
                            <div class="card">
                                <div class="card-block">
                                    <div class="row">
                                        <div class="col-sm-5">
                                            <h3 class="card-title clearfix mb-0">Total Collection</h3>
                                        </div>
                                        <div class="col-sm-7">
                                            
                                            <fieldset class="form-group float-right">
                                                <div class="input-group float-right" style="width:240px;">
                                                </div>
                                            </fieldset>
                                        </div>
                                    </div>
                                    <hr class="m-0">
                                    <div class="row">
                                        
                                        <div class="col-sm-6 col-lg-4">
                                            <div class="row">
                                                <div class="col-sm-6">
                                                    <div class="callout callout-warning">
                                                        <small class="text-muted">GHs</small>
                                                        <br>
                                                        <strong class="h4" id="ghs">78,623</strong>
                                                        <div class="chart-wrapper">
                                                            <canvas id="sparkline-chart-3" width="100" height="30"></canvas>
                                                        </div>
                                                    </div>
                                                </div>
                                                <!--/.col-->
                                                <div class="col-sm-6">
                                                    <div class="callout callout-success">
                                                        <small class="text-muted">EUR</small>
                                                        <br>
                                                        <strong class="h4" id="eur">49,123</strong>
                                                        <div class="chart-wrapper">
                                                            <canvas id="sparkline-chart-4" width="100" height="30"></canvas>
                                                        </div>
                                                    </div>
                                                </div>
                                                <!--/.col-->
                                            </div>
                                            <!--/.row-->
                                            
                                        </div>
                                        <!--/.col-->
                                        <div class="col-sm-6 col-lg-4">
                                            <div class="row">
                                                <div class="col-sm-6">
                                                    <div class="callout">
                                                        <small class="text-muted">GBP</small>
                                                        <br>
                                                        <strong class="h4" id="gbp">23</strong>
                                                        <div class="chart-wrapper">
                                                            <canvas id="sparkline-chart-5" width="100" height="30"></canvas>
                                                        </div>
                                                    </div>
                                                </div>
                                                <!--/.col-->
                                                <div class="col-sm-6">
                                                    <div class="callout callout-primary">
                                                        <small class="text-muted">USD</small>
                                                        <br>
                                                        <strong class="h4" id="usd">5</strong>
                                                        <div class="chart-wrapper">
                                                            <canvas id="sparkline-chart-6" width="100" height="30"></canvas>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>                                       
                                        </div>
                                    </div>                                 
                                </div>
                            </div>
                        </div>
                        <!--/.col-->
                    </div>
                    <!--/.row-->
                </div>


            </div>
        
        </main>

    </div>

 
    <script src="../../static/js/libs/jquery.min.js"></script>
    <script src="../../static/js/libs/index.js"></script>
    <script src="../../static/js/libs/bootstrap.min.js"></script>
    <script src="../../static/js/libs/pace.min.js"></script>

    <script src="../../static/js/libs/Chart.min.js"></script>
    <!-- GenesisUI main scripts -->
    <script src="../../static/js/app.js"></script>

     <!-- Plugins and scripts required by this views -->
    <script src="../../static/js/libs/toastr.min.js"></script>
    <script src="../../static/js/libs/gauge.min.js"></script>
    <script src="../../static/js/libs/moment.min.js"></script>
    <script src="../../static/js/libs/daterangepicker.js"></script>

    <!-- Custom scripts required by this view -->
    <script src="../../static/js/views/main.js"></script>

    <script type="text/javascript">
        $(document).ready(function () {
            //$('.routeClass').text('14');

            $.getJSON('/Dash/getDashValues', {}, function (fn) {
                if (fn.status.toString() == "true") {
                    $('.routeClass').text(fn.routesValue.toString());
                    $('.tellers').text(fn.tellerDta.toString());
                    $('.pickupClients').text(fn.pickupDta.toString());
                    $('.actUsers').text(fn.activeUsrs.toString());
                    $('.loggedUsers').text(fn.loggedUsrs.toString());

                    $.each(fn.topTenPickups, function (i, d) {
                        console.log(d.objCashCollection.customerName.toString());
                    });
                }
            });
        });
    </script>
</asp:Content>

