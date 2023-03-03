Ext.onReady(function () {
    //<!--<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCFp69zTVj55248g0q8t_WnIH4Q519KRHQ&ampcallback=initializeMap" defer></script>-->
    Ext.QuickTips.init();

    var R_LOGFILE = '';
    var R_PICKUPFILE = '';
    var R_SPECIEFILE = '';
    var R_TELLR = '';
    var IAS_REKORD = '';
    var DHL_REKORD = '';

    var specieP_editor = new Ext.ux.grid.RowEditor();
    var specieP_authorized_editor = new Ext.ux.grid.RowEditor();
    var coll_editor = new Ext.ux.grid.RowEditor();
    var tellr_editor = new Ext.ux.grid.RowEditor();
    var IAS_authorized_editor = new Ext.ux.grid.RowEditor();

    var getProcessNumber = function (TTP, k) {
        $.getJSON('/Home/generateOrderNumber', {TTYPE:TTP}, function (r) {
            if (r.status.toString() == "true") {
                k.setValue(r.msg.toString());
            }
        });
    }

    var loadRPreviewData = function (dta, k) {
        var arr = [];
        $.each(dta, function (i, d) {
            arr[i] = [d.routeId, d.branch.toString(), d.tripFrom.toString(), d.tripTo.toString(), d.Km.toString(), d.rateKm.toString()];
        });
        k.getStore().loadData(arr);
    }

    var loadSPECIEPreviewData = function (dta, k) {
        var arr = [];
        $.each(dta, function (i, d) {
            arr[i] = [d.Id, d.branch.toString(), d.objRoute.tripFrom,d.objRoute.tripTo, d.Milage, d.FrequencyOfTrip, d.RevenueFromRate];
        });
        k.getStore().loadData(arr);
    }

    var loadPICKUPPreviewData = function (dta, k) {
        var arr = [];
        console.log(dta);
        $.each(dta, function (i, d) {
            //arr[i] = [d.Id, d.Date.toString(), d.branch.toString(), d.vehicleRegistration, d.NameOfDriver.toString(), d.objRoute.tripFrom, d.objRoute.tripTo, d.tripStartTime, d.tripEndTime, d.amountDelivered.toString(), d.amountRepatriated.toString(), d.NIBOfficer.toString(), d.totalMilage.toString(), d.KmEquivalent.toString()];
            arr[i] = [d.Id, d.branch, d.customerName, d.customerLocation, d.pickFrequency.toString(), d.rate.toString(), d.amt.toString(), d.total.toString(), d.isWeekDayExpr.toString()];
        });
        k.getStore().loadData(arr);
    }

    var loadTELLRPreviewData = function (dta, k) {
        var arr = [];
        $.each(dta, function (i, d) {
            arr[i] = [d.Id, d.objCompany.branchCode,d.location, d.tellerNumbers, d.tellerNames, d.tRate, d.amount];
        });

        k.getStore().loadData(arr);
    }

    var loadIASPreviewDta = function (dta, k) {
        var arr = [];
        $.each(dta, function (i, d) {
            arr[i] = [i, d.companyCode, d.airwayBillNo, d.shipper, d.receipient, d.weightInKg.toString(),
                d.airwayBillDateString, d.charge.toString(), d.discount.toString(), d.subTotal.toString(), d.valueAddedTax.toString(),
                d.NHIL.toString(), d.netAmount.toString(), d.insurance.toString(), d.total.toString()];
        });
        
        k.getStore().loadData(arr);
    }

    var getProcessList = function (TYP, k) {
        var dt = [];
        $.getJSON('/Home/getProcessList', {PTYP: TYP}, function (rs) {
            if (rs.status.toString() == "true") {
                $.each(rs.msg, function (i, d) {
                    dt[i] = [d.Id,d.processType.toString(),d.processName.toString()];
                });

                k.getStore().loadData(dt);
            }
        });
    }

    var loadOfficials = function (k) {
        $.getJSON('/Home/getStaffList', {}, function (r) {
            if (r.status.toString() == "true") {
                var arr = [];
                $.each(r.msg, function (i, d) {
                    arr[i] = [d.Id, d.staffNumber, d.surname, d.objCompany.branchName, d.capacity, d.emailAddress, d.mobile];
                });

                k.getStore().loadData(arr);
            }
        });
    }

    var loadUsers = function (k) {
        $.getJSON('/Home/getUserList', {}, function (r) {
            if (r.status.toString() == "true") {
                var o = [];
                $.each(r.msg, function (i, d) {
                    o[i] = [d.Id, d.username, d.objCompany.branchCode, d.objCompany.branchName, d.profile];
                });

                console.log(o);
                k.getStore().loadData(o);
            }
        });
    }
    
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

    var loadUnAuthorizedFedexData = function (LSTATUS, PROGRESS_STATUS, KTRL) {
        $.getJSON('/Home/getUnauthorizedIASFedexData', { LOAD: LSTATUS, STAT: PROGRESS_STATUS }, function (dd) {
            if (dd.status.toString() == "true") {
                var ar = [];
                $.each(dd.msg, function (i, d) {
                    ar[i] = [d.Id, d.objProcess.processName.toString()];
                });

                KTRL.getStore().loadData(ar);
            }
        });
    }

    var QPFinder = function (k, FIL, TYP, P1, P2) {
        //k = grid control
        //FIL = PICKUPS, SPECIE
        //TYP = type of query...FILE or DATE RANGE
        //P1 and P2 are parameters one and two
        var dd = [];
        switch (FIL) {
            case 'PICKUPS':
                if (TYP == '') {
                    //use P1 and P2 to fetch data
                    $.getJSON('/Home/getPickupUsingDate', { df: P1, dt: P2 }, function (r) {
                        if (r.status.toString() == "true") {
                            $.each(r.msg, function (i, d) {
                                dd[i] = [d.Id, d.objPickup.Date, d.objCompany.branchCode, d.objPickup.vehicleRegistration, d.objPickup.NameOfDriver, d.objRoute.tripFrom, d.objRoute.tripTo, d.objPickup.tripStartTime, d.objPickup.tripEndTime, d.objPickup.amountDelivered, d.objPickup.amountRepatriated, d.objPickup.NIBOfficer, d.objPickup.totalMilage, d.objPickup.KmEquivalent.toString(), d.objPickup.KmEquivalent.toString()];
                            });
                            k.getStore().loadData(dd);
                        }
                    });
                }
                else {
                    $.getJSON('/Home/getPickupsUsingFileName', { FNAME: TYP }, function (r) {
                        if (r.status.toString() == "true") {
                            $.each(r.msg, function (i, d) {
                                dd[i] = [d.Id, d.objPickup.Date, d.objCompany.branchCode, d.objPickup.vehicleRegistration, d.objPickup.NameOfDriver,
                                    d.objRoute.tripFrom, d.objRoute.tripTo, d.objPickup.tripStartTime, d.objPickup.tripEndTime, d.objPickup.amountDelivered,
                                    d.objPickup.amountRepatriated, d.objPickup.NIBOfficer, d.objPickup.totalMilage, d.objPickup.KmEquivalent.toString(), d.objPickup.KmEquivalent.toString()];
                            });

                            k.getStore().loadData(dd);
                        }
                    });
                }//use file name to fetch data

                return;
            case 'SPECIEMOV':
                if (TYP == '') {

                }
                else {
                    $.getJSON('/Home/getSpecieMovementUsingFileName', { FNAME: TYP }, function (r) {
                        if (r.status.toString() == "true") {
                            $.each(r.msg, function (i, d) {
                                dd[i] = [d.Id, d.objCompany.branchCode, d.objRoute.tripFrom, d.objRoute.tripTo, d.objSpecie.Milage,
                                    d.objSpecie.FrequencyOfTrip, d.objSpecie.RevenueFromRate, d.objSpecie.branchRevenueInput, 'Authorized'];// d.objSpecie.HORevenueInput];
                            });
                            k.getStore().loadData(dd);
                        }
                    });
                }
        }
    }

    var xchangeDta = function (k, xFLG) {
        $.getJSON('/Home/getExchangeRates', {FLG: xFLG}, function (rr) {
            if (rr.status.toString() == "true") {
                var dt = [];
                $.each(rr.msg, function (i, d) {
                    dt[i] = [d.Id, d.objCurrency.nameOfcurrency,d.objCurrency.symbolOfcurrency, d.x_rate, d.dte];
                });

                k.getStore().loadData(dt);
            }
        });
    }

    var fp = new Ext.FormPanel({
        id: 'fp',
        fileUpload: true,
        width: 500,
        frame: true,
        title: 'Pickup Upload Form',
        autoHeight: true,
        bodyStyle: 'padding: 10px 10px 0 10px;',
        labelWidth: 50,
        defaults: {
            anchor: '95%',
            allowBlank: false,
            msgTarget: 'side'
        },
        items: [{
            xtype: 'textfield',
            fieldLabel: 'Name',
            id: 'f_id',
            emptyText: 'enter name of file'
        }, {
            xtype: 'fileuploadfield',
            id: 'form-file',
            emptyText: 'Select a file',
            fieldLabel: 'File',
            name: 'file-path',
            buttonText: '',
            buttonCfg: {
                iconCls: 'upload-icon'
            }
        }],
        buttons: [{
            text: 'Save Pickups',
            handler: function () {
                if (fp.getForm().isValid()) {
                    fp.getForm().submit({
                        url: '/Upload/UploadPickups',
                        waitMsg: 'Uploading buillion pickup data...',
                        standardSubmit: true,
                        params: { caption: Ext.fly('f_id').getValue() },
                        success: function (form, action) {
                            var data = JSON.parse(action.response.responseText);
                            if (data.success.toString() == "true") {
                                loadPICKUPPreviewData(data.good, Ext.getCmp('grdPickupPreview'));
                                getProcessList('PICKUPS', Ext.getCmp('grdPickupLogs'));
                                getProcessNumber('PICKUPS', Ext.getCmp('f_id'));
                                R_PICKUPFILE = Ext.fly('f_id').getValue();
                                $('#f_id').attr('readonly', true);
                            }
                        },
                        failure: function (form, action) {

                        }
                    });
                }
            }
        }, {
            text: 'Reset',
            handler: function () {
                fp.getForm().reset();
            }
        }]
    });

    var ProcForm = new Ext.Panel({
        id: 'ProcForm', height: 1000, width: 'auto', frame: true, border: true, layout: 'card', autoScroll: true, activeItem: 0,
        defaults: { xtype: 'panel' },
        items: [
            {                
                title: 'DashBoard', id: 'xxx',
                listeners: {
                    'render': function () {
                        $.get('/Home/Dashy', {}, function (fs) {
                            $('#xxx').html(fs);
                        });
                    }
                }               
            },
            {
                defaults: { xtype: 'panel', frame: true, border: true }, layout: 'column',
                items: [                   
                    {
                        columnWidth: .4, height: 600,
                        defaults: { xtype: 'form', frame: true, border: true }, layout: 'accordion',
                        items: [
                            fp,
                            {
                                title: 'Previous Monthly Logs',
                                items: [
                                    new Ext.grid.GridPanel({
                                        id: 'grdPickupLogs', title: '', height: 500, autoScroll: true, autoExpandColumn: 'processName',
                                        store: new Ext.data.GroupingStore({
                                            reader: new Ext.data.ArrayReader({}, [
                                                { name: 'Id', type: 'int' },
                                                { name: 'processType', type: 'string' },
                                                { name: 'processName', type: 'string' }
                                            ]),
                                            sortInfo: {
                                                field: "Id",
                                                direction: "ASC"
                                            },
                                            groupField: "processName"
                                        }),
                                        columns: [
                                             { id: 'Id', header: 'ID', width: 25, hidden: true, sortable: true, dataIndex: 'Id' },
                                             { id: 'processType', header: 'PROCESSTYPE', width: 200, hidden: true, sortable: true, dataIndex: 'processType' },
                                             { id: 'processName', header: 'FILE', width: 200, hidden: false, sortable: true, dataIndex: 'processName' }
                                        ], stripeRows: true,
                                        viewConfig: {
                                            getRowClass: function (record, rowIndex, rowParams, store) {
                                                return ((rowIndex % 2) == 0) ? "even-class" : "odd-class";
                                            }
                                        },
                                        listeners: {
                                            'render': function () {
                                                getProcessList('PICKUPS', Ext.getCmp('grdPickupLogs'));
                                            },
                                            'afterrender': function () {
                                                setInterval(function () { getProcessList('PICKUPS', Ext.getCmp('grdPickupLogs')) }, 120000);
                                            },
                                            'rowdblclick': function (e, t) {
                                                var rec = e.getStore().getAt(t);
                                                R_PICKUPFILE = rec.get('processName');
                                                $.getJSON('/Home/getPickupLogRecords', {PLogFile: rec.get('processName')}, function (rs) {
                                                    if (rs.status.toString() == "true") {
                                                        var dt = [];
                                                        $.each(rs.msg, function (i, d) {
                                                            dt[i] = [d.Id, d.objCompany.branchCode, d.objCashCollection.customerName, d.objCashCollection.customerLocation, d.objCashCollection.pickFrequency.toString(), d.objCashCollection.rate.toString(), d.objCashCollection.amt.toString(), d.objCashCollection.total.toString(), d.objCashCollection.isWeekDayExpr.toString()];

                                                        });
                                                        Ext.getCmp('grdPickupPreview').getStore().loadData(dt);
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
                        columnWidth: .6, title: 'Pickup Preview Area', defaults: { xtype: 'form', frame: true, border: true }, layout: 'fit',
                        items: [
                            new Ext.grid.GridPanel({
                                id: 'grdPickupPreview', title: '', height: 500, autoScroll: true, autoExpandColumn: 'branch',
                                store: new Ext.data.GroupingStore({
                                    reader: new Ext.data.ArrayReader({}, [
                                        { name: 'Id', type: 'int' },
                                        { name: 'branch', type: 'string' },
                                        { name: 'CustomerName', type: 'string' },
                                        { name: 'CustomerLocation', type: 'string' },
                                        { name: 'pickFrequency', type: 'int' },
                                        { name: 'rate', type: 'string' },
                                        { name: 'amt', type: 'string' },
                                        { name: 'total', type: 'string' },
                                        { name: 'isWeekDayExpr', type: 'string' }
                                    ]),
                                    sortInfo: {
                                        field: "Id",
                                        direction: "ASC"
                                    },
                                    groupField: "Id"
                                }),
                                columns: [
                                     { id: 'Id', header: 'ID', width: 25, hidden: true, sortable: true, dataIndex: 'Id' },
                                     { id: 'branch', header: 'BRANCH', width: 150, hidden: false, sortable: true, dataIndex: 'branch' },
                                     { id: 'CustomerName', header: 'CUSTOMER', width: 150, hidden: false, sortable: true, dataIndex: 'CustomerName' },
                                     { id: 'CustomerLocation', header: 'LOCATION', width: 150, hidden: false, sortable: true, dataIndex: 'CustomerLocation' },
                                     { id: 'pickFrequency', header: 'FREQ', width: 70, hidden: false, sortable: true, dataIndex: 'pickFrequency' },
                                     { id: 'rate', header: 'RATE', width: 70, hidden: false, sortable: true, dataIndex: 'rate' },
                                     { id: 'amt', header: 'AMOUNT', width: 90, hidden: false, sortable: true, dataIndex: 'amt' },
                                     { id: 'total', header: 'GRANDTOTAL', width: 100, hidden: false, sortable: true, dataIndex: 'total' },
                                     { id: 'isWeekDayExpr', header: 'WEEKDAY', width: 70, hidden: false, sortable: true, dataIndex: 'isWeekDayExpr' }
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
                                id: '', text: 'Commit Pickup Upload',
                                listeners: {
                                    'click': function (btn) {
                                        if ($('#f_id').val().length > 0) {
                                            $.getJSON('/Upload/PersistPickupData', { UPL: R_PICKUPFILE },
                                                function (r) {
                                                    if (r.status.toString() == "true") {
                                                        Ext.Msg.alert('Commit Upload Status', 'Uploaded committed successfully for Pickup Data', this);
                                                    }
                                                    if (r.status.toString() == "false") {
                                                        Ext.Msg.alert("Pickup Upload Status", r.msg.toString(), this);
                                                    }
                                                });
                                        }
                                    }
                                }
                            },
                            {
                                id: '', text: 'Delete Pickup Upload',
                                listeners: {
                                    'click': function (btn) {
                                        if (Ext.getCmp('grdPickupPreview').getStore().getCount() > 0 && R_PICKUPFILE.length > 0) {
                                            $.getJSON('/Upload/DeletePickupData', {UPL: R_PICKUPFILE}, function (rs) {
                                                if (rs.status.toString() == "true") {
                                                    Ext.Msg.alert('DELETE COLLECTION STATUS', R_PICKUPFILE + ' deleted successfully', this);
                                                    R_PICKUPFILE = '';
                                                }
                                                else {
                                                    Ext.Msg.alert('DELETE COLLECTION STATUS', rs.msg, this);
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
                defaults: { xtype: 'panel', frame: true, border: true }, layout: 'column',
                items: [
                    {
                        columnWidth: .4, height: 600,
                        defaults: { xtype: 'form', frame: true, border: true }, layout: 'accordion',
                        items: [
                            {
                                title: 'Routes Upload Form',id: 'routesFm', fileUpload: true, width: 500, autoHeight: true,
                                bodyStyle: 'padding: 10px 10px 0 10px;',labelWidth: 50,defaults: { anchor: '95%',allowBlank: false,msgTarget: 'side'},
                                items: [
                                    {
                                        id: 'route-n',xtype: 'textfield', fieldLabel: 'Name'
                                    },
                                    {
                                        xtype: 'fileuploadfield', fieldLabel: 'File', id: 'routes-id', name: 'routes-file-path',buttonText: '...', buttonCfg: {
                                            iconCls: 'upload-icon'
                                        }
                                    }
                                ],
                                buttons: [
                                    {
                                        id: '', text: 'Save Routes',
                                        handler: function () {
                                            var rf = Ext.getCmp('routesFm');
                                            if (rf.getForm().isValid()) {
                                                rf.getForm().submit({
                                                    url: '/Upload/UploadRoutes',
                                                    waitMsg: 'Uploading your file...',
                                                    standardSubmit: true,
                                                    params: {caption:Ext.fly('route-n').getValue()},
                                                    success: function (form, action) {
                                                        var data = JSON.parse(action.response.responseText);
                                                        if (data.success.toString() == "true") {
                                                            loadRPreviewData(data.good, Ext.getCmp('grdRoutesDtaPreview'));
                                                        }
                                                    },
                                                    failure: function (form, action) {
                                                        var data = JSON.parse(action.response.responseText);
                                                        alert(data.toString());
                                                    }
                                                });
                                            }
                                        }
                                    },
                                    {
                                        text: 'Reset',
                                        handler: function () {
                                            Ext.getCmp('routesFm').getForm().reset();
                                        }
                                    }
                                ]
                            },
                            {
                                title: 'Routes Log',
                                items: [
                                    new Ext.grid.GridPanel({
                                        id: 'grdRoutesLog', title: '', height: 500, autoScroll: true, autoExpandColumn: 'processName',
                                        store: new Ext.data.GroupingStore({
                                            reader: new Ext.data.ArrayReader({}, [
                                                { name: 'Id', type: 'int' },
                                                { name: 'processType', type: 'string' },
                                                { name: 'processName', type: 'string' }
                                            ]),
                                            sortInfo: {
                                                field: "Id",
                                                direction: "ASC"
                                            },
                                            groupField: "Id"
                                        }),
                                        columns: [
                                             { id: 'Id', header: 'ID', width: 25, hidden: true, sortable: true, dataIndex: 'Id' },
                                             { id: 'processType', header: 'PROCESS TYPE', width: 200, hidden: true, sortable: true, dataIndex: 'processType' },
                                             { id: 'processName', header: 'FILE', width: 100, hidden: false, sortable: true, dataIndex: 'processName' }
                                        ], stripeRows: true,
                                        viewConfig: {
                                            getRowClass: function (record, rowIndex, rowParams, store) {
                                                return ((rowIndex % 2) == 0) ? "even-class" : "odd-class";
                                            }
                                        },
                                        listeners: {
                                            'render': function () {
                                                getProcessList('ROUTE', Ext.getCmp('grdRoutesLog'));
                                            },
                                            'afterrender': function () {
                                                setInterval(function () { getProcessList('ROUTE', Ext.getCmp('grdRoutesLog')); }, 120000);
                                            },
                                            'rowdblclick': function (e, t) {
                                                var rek = e.getStore().getAt(t);
                                                R_LOGFILE = rek.get('processName');
                                                $.getJSON('/Home/getVehicleRoutesRecords', { RLogFile: rek.get('processName') },
                                                    function (rs) {
                                                        if (rs.status.toString() == "true") {
                                                            var rd = [];
                                                            $.each(rs.msg, function (i, d) {
                                                                rd[i] = [d.Id,d.objCompany.branchCode,d.routeFrom,d.routeTo,d.distanceInKm,d.ratePerKm];
                                                            });

                                                            Ext.getCmp('grdRoutesDtaPreview').getStore().loadData(rd);
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
                        title: 'Routes Data', columnWidth: .6, defaults: { xtype: 'form', frame: true, border: true }, layout: 'fit',
                        items: [
                            {
                                id: 'routesDtaFm', 
                                items: [
                                    new Ext.grid.GridPanel({
                                        id: 'grdRoutesDtaPreview', title: '', height: 500, autoScroll: true, autoExpandColumn: 'branch',
                                        store: new Ext.data.GroupingStore({
                                            reader: new Ext.data.ArrayReader({}, [
                                                { name: 'routeId', type: 'int' },
                                                { name: 'branch', type: 'string' },
                                                { name: 'tripFrom', type: 'string' },
                                                { name: 'tripTo', type: 'string' },
                                                { name: 'Km', type: 'string' },
                                                { name: 'rateKm', type: 'string' }
                                            ]),
                                            sortInfo: {
                                                field: "routeId",
                                                direction: "ASC"
                                            },
                                            groupField: "routeId"
                                        }),
                                        columns: [
                                             { id: 'routeId', header: 'ID', width: 25, hidden: true, sortable: true, dataIndex: 'routeId' },
                                             { id: 'branch', header: 'COMPANY', width: 200, hidden: false, sortable: true, dataIndex: 'branch' },
                                             { id: 'tripFrom', header: 'FROM', width: 100, hidden: false, sortable: true, dataIndex: 'tripFrom' },
                                             { id: 'tripTo', header: 'TO', width: 100, hidden: false, sortable: true, dataIndex: 'tripTo' },
                                             { id: 'Km', header: 'DISTANCE', width: 70, hidden: false, sortable: true, dataIndex: 'Km' },
                                             { id: 'rateKm', header: 'RATE/KM', width: 70, hidden: false, sortable: true, dataIndex: 'rateKm' }
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
                                        id: 'btnCmmitUpload', text: 'Commit Upload',
                                        listeners: {
                                            'click': function (btn) {
                                                if ($('#route-n').val().length > 0) {
                                                    $.getJSON('/Upload/PersistUploadedRoutes', { UPL: R_LOGFILE },
                                                        function (rs) {
                                                            if (rs.status.toString() == "true") {
                                                                Ext.Msg.alert('Commit Upload Status', 'Uploaded committed successfully', this);
                                                            }
                                                            
                                                            if (rs.status.toString() == "false"){
                                                                Ext.Msg.alert('Data Already Committed', rs.msg.toString(), this);
                                                            }

                                                            R_LOGFILE = '';
                                                        });
                                                }
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
                defaults: { xtype: 'panel', frame: true, border: true }, layout: 'column',height:700,
                items: [
                    {
                        columnWidth: .4, height: 200,
                        defaults: { xtype: 'form', frame: true, allowBlank: false }, layout: 'accordion',
                        items: [
                            {
                                id:'specieFm',title: 'Specie Upload Form',fileUpload: true, width: 500, defaults: { anchor: '95%',allowBlank: false, msgTarget: 'side' }, bodyStyle: 'padding: 10px 10px 0 10px;', labelWidth: 50,
                                items: [
                                   { id: 'specieName', xtype: 'textfield', fieldLabel: 'Name' },
                                   {
                                       id: '', xtype: 'fileuploadfield', fieldLabel: 'File', name: 'specie-name', buttonText: '...', buttonCfg: {
                                           iconCls: 'upload-icon'
                                       }
                                   }
                                ],
                                buttons: [
                                    {
                                        id: '', text: 'Save Specie',
                                        handler: function () {
                                            var specieF = Ext.getCmp('specieFm');
                                            if (specieF.getForm().isValid()) {
                                                specieF.getForm().submit({
                                                    url: '/Upload/UploadSpecie',
                                                    waitMsg: 'Uploading your specie file...',
                                                    standardSubmit: true,
                                                    params: { caption: Ext.fly('specieName').getValue() },
                                                    success: function (form, action) {
                                                        var data = JSON.parse(action.response.responseText);
                                                        if (data.success.toString() == "true") {
                                                            loadSPECIEPreviewData(data.good, Ext.getCmp('grdSpecieDtaPreview'));
                                                        }
                                                    },
                                                    failure: function (form, action) {
                                                        var data = JSON.parse(action.response.responseText);
                                                        Ext.Msg.alert('SAVE SPECIE STATUS', 'An error occured', this);
                                                    }
                                                });
                                            }
                                        }
                                    },
                                    {
                                        text: 'Reset',
                                        handler: function (btn) {

                                        }
                                    }
                                ]
                            },
                            {
                                title: 'Specie Previous Logs',
                                items: [
                                    new Ext.grid.GridPanel({
                                        id: 'grdSpecieLogs', title: '', height: 500, autoScroll: true, autoExpandColumn: 'processName',
                                        store: new Ext.data.GroupingStore({
                                            reader: new Ext.data.ArrayReader({}, [
                                                { name: 'Id', type: 'int' },
                                                { name: 'processType', type: 'string' },
                                                { name: 'processName', type: 'string' }
                                            ]),
                                            sortInfo: {
                                                field: "Id",
                                                direction: "ASC"
                                            },
                                            groupField: "processName"
                                        }),
                                        columns: [
                                             { id: 'Id', header: 'ID', width: 25, hidden: true, sortable: true, dataIndex: 'Id' },
                                             { id: 'processType', header: 'PROCESSTYPE', width: 200, hidden: true, sortable: true, dataIndex: 'processType' },
                                             { id: 'processName', header: 'FILE', width: 200, hidden: false, sortable: true, dataIndex: 'processName' }
                                        ], stripeRows: true,
                                        viewConfig: {
                                            getRowClass: function (record, rowIndex, rowParams, store) {
                                                return ((rowIndex % 2) == 0) ? "even-class" : "odd-class";
                                            }
                                        },
                                        listeners: {
                                            'render': function () {
                                                getProcessList('SPECIEMOV', Ext.getCmp('grdSpecieLogs'));
                                            },
                                            'afterrender': function () {
                                                setInterval(function () { getProcessList('SPECIEMOV',Ext.getCmp('grdSpecieLogs')) },120000);
                                            },
                                            'rowdblclick': function (e, t) {
                                                var rec = e.getStore().getAt(t);
                                                R_SPECIEFILE = rec.get('processName');
                                                $.getJSON('/Home/getSpecieLogRecords', {SLogFile:rec.get('processName')}, function (rs) {
                                                    if (rs.status.toString() == "true") {
                                                        var ar = [];
                                                        $.each(rs.msg, function (i, d) {
                                                            ar[i] = [d.Id, d.objCompany.branchCode, d.objRoute.tripFrom, d.objRoute.tripTo, d.objSpecie.Milage, d.objSpecie.FrequencyOfTrip, d.objSpecie.RevenueFromRate];
                                                        });

                                                        Ext.getCmp('grdSpecieDtaPreview').getStore().loadData(ar);
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
                        title: 'Specie Data', columnWidth: .6, defaults: { xtype: 'form', frame: true, border: true }, layout: 'fit',
                        items: [
                            {
                                id: '', 
                                items: [
                                    new Ext.grid.GridPanel({
                                        id: 'grdSpecieDtaPreview', title: '', height: 500, autoScroll: true, autoExpandColumn: 'branch',
                                        store: new Ext.data.GroupingStore({
                                            reader: new Ext.data.ArrayReader({}, [
                                                { name: 'Id', type: 'int' },
                                                { name: 'branch', type: 'string' },
                                                { name: 'tripFrom', type: 'string' },
                                                { name: 'tripTo', type: 'string'},
                                                { name: 'Milage', type: 'string' },
                                                { name: 'FrequencyOfTrip', type: 'string' },
                                                { name: 'RevenueFromRate', type: 'string' }
                                            ]),
                                            sortInfo: {
                                                field: "branch",
                                                direction: "ASC"
                                            },
                                            groupField: "branch"
                                        }),
                                        columns: [
                                             { id: 'Id', header: 'ID', width: 25, hidden: true, sortable: true, dataIndex: 'Id' },
                                             { id: 'branch', header: 'COMPANY', width: 200, hidden: false, sortable: true, dataIndex: 'branch' },
                                             { id: 'tripFrom', header: 'ROUTE FROM', width: 100, hidden: false, sortable: true, dataIndex: 'tripFrom' },
                                             { id: 'tripTo', header: 'ROUTE TO', width: 100, hidden: false, sortable: true, dataIndex: 'tripTo' },
                                             { id: 'Milage', header: 'MILAGE', width: 100, hidden: false, sortable: true, dataIndex: 'Milage' },
                                             { id: 'FrequencyOfTrip', header: 'FREQUENCY', width: 70, hidden: false, sortable: true, dataIndex: 'FrequencyOfTrip' },
                                             { id: 'RevenueFromRate', header: 'ACCRUED REVENUE', width: 70, hidden: false, sortable: true, dataIndex: 'RevenueFromRate' }
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
                                        id: '', text: 'Commit Specie Upload',
                                        listeners: {
                                            'click': function (btn) {
                                                if ($('#specieName').val().length > 0) {
                                                    $.getJSON('/Upload/PersistSpecieMovementData', { UPL: R_SPECIEFILE },
                                                        function (r) {
                                                            if (r.status.toString() == "true") {
                                                                Ext.Msg.alert('Commit Upload Status', 'Uploaded committed successfully', this);
                                                            }

                                                            if (r.status.toString() == "false") {
                                                                Ext.Msg.alert('Specie Upload Status', r.msg.toString(), this);
                                                            }
                                                        });
                                                }
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
                defaults: { xtype: 'panel', frame: true, border: true }, layout: 'column',
                items: [
                    {
                        columnWidth: .4,height:600, defaults: { xtype: 'form', frame: true, border: true, collapsible: true }, layout: 'form',
                        items: [
                            {
                                id: 'tlrFrm', title: 'Bill Upload Form', fileUpload: true,  defaults: { anchor: '100%', allowBlank: false, msgTarget: 'side' },
                                bodyStyle: 'padding: 5px 5px 0 5px;', labelWidth: 50,
                                items: [
                                    { id: 'tellerName', xtype: 'textfield', fieldLabel: 'Name', anchor: '95%' },
                                    {
                                        id: 'teller-name', xtype: 'fileuploadfield', fieldLabel: 'File', name: 'teller-name', buttonText: '...', buttonCfg: {
                                            iconCls: 'upload-icon'
                                        }
                                    }
                                ],
                                buttons: [
                                    {
                                        id: '', text: 'Save',
                                        listeners: {
                                            'click': function () {
                                                var tlF = Ext.getCmp('tlrFrm');
                                                if (tlF.getForm().isValid()) {
                                                    tlF.getForm().submit({
                                                        url: '/Upload/UploadTellerBills',
                                                        waitMsg: 'Uploading your specie file...',
                                                        standardSubmit: true,
                                                        params: { caption: Ext.fly('tellerName').getValue() },
                                                        success: function (form, action) {
                                                            var data = JSON.parse(action.response.responseText);
                                                            if (data.success.toString() == "true") {
                                                                loadTELLRPreviewData(data.good, Ext.getCmp('grdBillPreview'));
                                                                getProcessList('TELLR', Ext.getCmp('grdBillLogs'));
                                                                R_TELLR = Ext.fly('tellerName').getValue();
                                                            }
                                                        },
                                                        failure: function (form, action) {
                                                            var data = JSON.parse(action.response.responseText);
                                                            Ext.Msg.alert('SAVE SPECIE STATUS', 'An error occured', this);
                                                        }
                                                    });
                                                }
                                            }
                                        }
                                    },
                                    { id: '', text: 'Reset' }
                                ]
                            },
                            {
                                id: '', title: 'Bill Upload Logs',
                                items: [
                                     new Ext.grid.GridPanel({
                                         id: 'grdBillLogs', title: '', height: 350, autoScroll: true, autoExpandColumn: 'processName',
                                         store: new Ext.data.GroupingStore({
                                             reader: new Ext.data.ArrayReader({}, [
                                                 { name: 'Id', type: 'int' },
                                                 { name: 'processType', type: 'string' },
                                                 { name: 'processName', type: 'string' }
                                             ]),
                                             sortInfo: {
                                                 field: "Id",
                                                 direction: "ASC"
                                             },
                                             groupField: "processName"
                                         }),
                                         columns: [
                                              { id: 'Id', header: 'ID', width: 25, hidden: true, sortable: true, dataIndex: 'Id' },
                                              { id: 'processType', header: 'PROCESSTYPE', width: 200, hidden: true, sortable: true, dataIndex: 'processType' },
                                              { id: 'processName', header: 'FILE', width: 200, hidden: false, sortable: true, dataIndex: 'processName' }
                                         ], stripeRows: true,
                                         viewConfig: {
                                             getRowClass: function (record, rowIndex, rowParams, store) {
                                                 return ((rowIndex % 2) == 0) ? "even-class" : "odd-class";
                                             }
                                         },
                                         listeners: {
                                             'render': function () {
                                                 getProcessList('TELLR', Ext.getCmp('grdBillLogs'));
                                             },
                                             'afterrender': function () {
                                                 setInterval(function () {
                                                     getProcessList('TELLR', Ext.getCmp('grdBillLogs'));
                                                 }, 20000);
                                             },
                                             'rowdblclick': function (e,t) {
                                                 var rec = e.getStore().getAt(t);
                                                 R_TELLR = rec.get('processName');
                                                 $.getJSON('/Home/getTellersUsingFileName', {Fn: rec.get('processName')}, function (r) {
                                                     if (r.status.toString() == "true") {
                                                         var ar = [];
                                                         $.each(r.msg, function (i, d) {
                                                             ar[i] = [d.Id, d.objCompany.branchCode, d.location, d.tellerNumbers, d.tellerNames, d.tRate, d.amount];
                                                         });

                                                         Ext.getCmp('grdBillPreview').getStore().loadData(ar);
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
                        title: 'Bill Data', columnWidth: .6, height: 600, defaults: { xtype: 'form', frame: true, border: true }, layout: 'form',
                        items: [
                            {
                                id: '',
                                items: [
                                    new Ext.grid.GridPanel({
                                        id: 'grdBillPreview', title: '', height: 500, autoScroll: true, autoExpandColumn: 'branchCode',
                                        store: new Ext.data.GroupingStore({
                                            reader: new Ext.data.ArrayReader({}, [
                                                { name: 'Id', type: 'int' },
                                                { name: 'branchCode', type: 'string' },
                                                { name: 'location', type: 'string' },
                                                { name: 'tellerNumbers', type: 'string' },
                                                { name: 'tellerNames', type: 'string' },
                                                { name: 'tRate', type: 'string' },
                                                { name: 'amount', type: 'string' }
                                            ]),
                                            sortInfo: {
                                                field: "branchCode",
                                                direction: "ASC"
                                            },
                                            groupField: "branchCode"
                                        }),
                                        columns: [
                                             { id: 'Id', header: 'ID', width: 25, hidden: true, sortable: true, dataIndex: 'Id' },
                                             { id: 'branchCode', header: 'COMPANY', width: 250, hidden: false, sortable: true, dataIndex: 'branchCode' },
                                             { id: 'location', header: 'LOCATION', width: 200, hidden: false, sortable: true, dataIndex: 'location' },
                                             { id: 'tellerNumbers', header: 'No. OF TELLERS', width: 100, hidden: false, sortable: true, dataIndex: 'tellerNumbers' },
                                             { id: 'tellerNames', header: 'TELLER NAMES', width: 300, hidden: false, sortable: true, dataIndex: 'tellerNames' },
                                             { id: 'tRate', header: 'RATE', width: 100, hidden: false, sortable: true, dataIndex: 'tRate' },
                                             { id: 'amount', header: 'AMOUNT', width: 70, hidden: false, sortable: true, dataIndex: 'amount' }
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
                                        id: '', text: 'Commit',
                                        listeners: {
                                            'click': function () {
                                                if (Ext.getCmp('grdBillPreview').getStore().getCount() > 0) {
                                                    $.post('/Upload/PersistTellersBillData', {UPL: R_TELLR}, function (rs) {
                                                        if (rs.status.toString() == "true") {
                                                            Ext.Msg.alert('TELLER COMMIT STATUS', R_TELLR + ' committed successfully to data store', this);
                                                            R_TELLR = '';
                                                        }
                                                        else { Ext.Msg.alert('TELLER COMMIT STATUS', rs.msg.toString(), this); }
                                                    },"json");
                                                }
                                            }
                                        }
                                    },
                                    {
                                        id: '', text: 'Delete Teller Upload',
                                        listeners: {
                                            'click': function (btn) {
                                                $.getJSON('/Upload/DeleteTellersBillData', {UPL:R_TELLR}, function (rs) {
                                                    if (rs.status.toString() == "true") {
                                                        Ext.Msg.alert("TELLER DELETE STATUS", R_TELLR + ' deleted successfully', this);
                                                        Ext.getCmp('grdBillPreview').getStore().removeAll();
                                                        getProcessList('TELLR', Ext.getCmp('grdBillLogs'));
                                                        R_TELLR = '';
                                                    }
                                                    else {
                                                        Ext.Msg.alert('TELLER DELETE STATUS', rs.msg, this);
                                                        R_TELLR = '';
                                                    }
                                                });
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
                title: 'CASH COLLECTIONS', defaults: { xtype: 'panel', frame: true, border: true }, height: 700, layout: 'column',
                items: [
                    {
                        columnWidth: .2, defaults: { xtype: 'form', frame: true, border: true },height:680,
                        items: [
                            {
                                id: 'frmCashApproved', title: 'Branch Approved',height:250,
                                items: [
                                    new Ext.grid.GridPanel({
                                        id: 'grdCollApproved', title: '', height: 500, autoScroll: true, autoExpandColumn: 'processName',
                                        store: new Ext.data.GroupingStore({
                                            reader: new Ext.data.ArrayReader({}, [
                                                { name: 'Id', type: 'int' },
                                                { name: 'processName', type: 'string' }
                                            ]),
                                            sortInfo: {
                                                field: "processName",
                                                direction: "ASC"
                                            },
                                            groupField: "processName"
                                        }),
                                        columns: [
                                             { id: 'Id', header: 'ID', width: 25, hidden: true, sortable: true, dataIndex: 'Id' },
                                             { id: 'processName', header: 'FILE', width: 250, hidden: false, sortable: true, dataIndex: 'processName' },
                                        ], stripeRows: true,
                                        viewConfig: {
                                            getRowClass: function (record, rowIndex, rowParams, store) {
                                                return ((rowIndex % 2) == 0) ? "even-class" : "odd-class";
                                            }
                                        },
                                        listeners: {
                                            'render': function () {
                                                getProcessNames(Ext.getCmp('grdCollApproved'), 'PICKUPS', 2);
                                            },
                                            'afterrender': function () {
                                                setInterval(function () {
                                                    getProcessNames(Ext.getCmp('grdCollApproved'), 'PICKUPS', 2);
                                                }, 120000);
                                            },
                                            'rowdblclick': function (e, t) {
                                                Ext.getCmp('grdCollAuthorization').getEl().mask("Fetching data..Please wait...", "x-mask-loading");
                                                var rec = e.getStore().getAt(t);

                                                $.getJSON('/Home/getPickupsUsingFileName', { FNAME: rec.get('processName') }, function (r) {
                                                    if (r.status.toString() == "true") {
                                                        var dd = [];
                                                        $.each(r.msg, function (i, d) {
                                                            dd[i] = [d.Id, d.objCompany.branchCode, d.objCashCollection.customerName, d.objCashCollection.customerLocation, d.objCashCollection.pickFrequency.toString(),
                                                                d.objCashCollection.rate.toString(), d.objCashCollection.amt.toString(), d.objCashCollection.total.toString(), d.objCashCollection.isWeekDayExpr.toString(),
                                                                d.objCashCollection.btotal.toString(), 'Authorized']; // 0];
                                                        });

                                                        Ext.getCmp('grdCollAuthorization').getEl().unmask();
                                                        Ext.getCmp('grdCollAuthorization').getStore().loadData(dd);
                                                    }
                                                });
                                            }
                                        }
                                    })
                                ]
                            },
                            {
                                id: '', title: 'Authorized',height: 300,
                                items: [
                                    new Ext.grid.GridPanel({
                                        id: 'grdCollAuthorized', title: '', height: 500, autoScroll: true, autoExpandColumn: 'processName',
                                        store: new Ext.data.GroupingStore({
                                            reader: new Ext.data.ArrayReader({}, [
                                                { name: 'Id', type: 'int' },
                                                { name: 'processName', type: 'string' }
                                            ]),
                                            sortInfo: {
                                                field: "processName",
                                                direction: "ASC"
                                            },
                                            groupField: "processName"
                                        }),
                                        columns: [
                                             { id: 'Id', header: 'ID', width: 25, hidden: true, sortable: true, dataIndex: 'Id' },
                                             { id: 'processName', header: 'FILE', width: 250, hidden: false, sortable: true, dataIndex: 'processName' },
                                        ], stripeRows: true,
                                        viewConfig: {
                                            getRowClass: function (record, rowIndex, rowParams, store) {
                                                return ((rowIndex % 2) == 0) ? "even-class" : "odd-class";
                                            }
                                        },
                                        listeners: {
                                            'render': function () {
                                                getProcessNames(Ext.getCmp('grdCollAuthorized'), 'PICKUPS', 3);
                                            },
                                            'afterrender': function () {
                                                setInterval(function () {
                                                    getProcessNames(Ext.getCmp('grdCollAuthorized'), 'PICKUPS', 3);
                                                }, 120000);
                                            },
                                            'rowdblclick': function (e, t) {
                                                Ext.getCmp('grdCollAuthorization').getEl().mask("Fetching data..Please wait...", "x-mask-loading");
                                                var rec = e.getStore().getAt(t);

                                                $.getJSON('/Home/getPickupsUsingFileName', { FNAME: rec.get('processName') }, function (r) {
                                                    if (r.status.toString() == "true") {
                                                        var dd = [];
                                                        $.each(r.msg, function (i, d) {
                                                            dd[i] = [d.Id, d.objCompany.branchCode, d.objCashCollection.customerName, d.objCashCollection.customerLocation, d.objCashCollection.pickFrequency.toString(),
                                                                d.objCashCollection.rate.toString(), d.objCashCollection.amt.toString(), d.objCashCollection.total.toString(), d.objCashCollection.isWeekDayExpr.toString(),
                                                                d.objCashCollection.btotal.toString(), d.objCashCollection.htotal.toString()];
                                                        });

                                                        Ext.getCmp('grdCollAuthorization').getEl().unmask();
                                                        Ext.getCmp('grdCollAuthorization').getStore().loadData(dd);
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
                        columnWidth: .8, defaults: { xtype: 'form', frame: true, border: true }, layout: 'form',
                        items: [
                            {
                                id: '', title: 'filtering', defaults: { xtype: 'combo', forceSelection: true, typeAhead: true, mode: 'local', allowBlank: false, anchor: '90%' }, layout: 'form',
                                items: [
                                    {
                                        id: 'grdCboBrn',fieldLabel: 'Select Branch',
                                        store: new Ext.data.Store({
                                            autoLoad: true, restful: false,
                                            url: '/Home/getCompanyList',
                                            reader: new Ext.data.JsonReader({type: 'json', root: 'msg'}, [
                                                { name: 'branchCode', type: 'string' },
                                                { name: 'branchName', type: 'string' }
                                            ])
                                        }), valueField: 'branchCode', displayField: 'branchName',
                                        listeners: {
                                            'select': function () {
                                                //fetch data for that particular company name
                                                $.getJSON('/Home/getPickupsUsingBranchCode', { BCODE: Ext.getCmp('grdCboBrn').getValue() }, function (r) {
                                                    if (r.status.toString() == "true") {
                                                        var dd = [];
                                                        $.each(r.msg, function (i, d) {
                                                            dd[i] = [d.Id, d.objCompany.branchCode, d.objCashCollection.customerName, d.objCashCollection.customerLocation, d.objCashCollection.pickFrequency.toString(),
                                                                d.objCashCollection.rate.toString(), d.objCashCollection.amt.toString(), d.objCashCollection.total.toString(), d.objCashCollection.isWeekDayExpr.toString(),
                                                                d.objCashCollection.btotal.toString(), 'Authorized']; // d.objCashCollection.htotal.toString()];
                                                        });

                                                        Ext.getCmp('grdCollAuthorization').getStore().removeAll();
                                                        Ext.getCmp('grdCollAuthorization').getStore().loadData(dd);
                                                    }
                                                });
                                            }
                                        }
                                    }
                                ]
                            },
                            {
                                id: 'frmCollAuthorization',
                                items: [
                                    new Ext.grid.GridPanel({
                                        id: 'grdCollAuthorization', title: 'Cash Collection Authorization', height: 500, autoScroll: true, autoExpandColumn: 'branch',
                                        plugins: [coll_editor],
                                        store: new Ext.data.GroupingStore({
                                            reader: new Ext.data.ArrayReader({}, [
                                                { name: 'Id', type: 'int' },
                                                { name: 'branch', type: 'string' },
                                                { name: 'CustomerName', type: 'string' },
                                                { name: 'CustomerLocation', type: 'string' },
                                                { name: 'pickFrequency', type: 'int' },
                                                { name: 'rate', type: 'string' },
                                                { name: 'amt', type: 'string' },
                                                { name: 'total', type: 'string' },
                                                { name: 'isWeekDayExpr', type: 'string' },
                                                { name: 'btotal', type: 'string' },
                                                { name: 'Htotal', type: 'string' }
                                            ]),
                                            sortInfo: {
                                                field: "Id",
                                                direction: "ASC"
                                            },
                                            groupField: "Id"
                                        }),
                                        columns: [
                                             { id: 'Id', header: 'ID', width: 25, hidden: true, sortable: true, dataIndex: 'Id' },
                                             { id: 'branch', header: 'BRANCH', width: 120, hidden: false, sortable: true, dataIndex: 'branch' },
                                             { id: 'CustomerName', header: 'CUSTOMER', width: 200, hidden: false, sortable: true, dataIndex: 'CustomerName' },
                                             { id: 'CustomerLocation', header: 'LOCATION', width: 200, hidden: false, sortable: true, dataIndex: 'CustomerLocation' },
                                             { id: 'pickFrequency', header: 'FREQ', width: 70, hidden: false, sortable: true, dataIndex: 'pickFrequency' },
                                             { id: 'rate', header: 'RATE', width: 70, hidden: false, sortable: true, dataIndex: 'rate' },
                                             { id: 'amt', header: 'AMOUNT', width: 70, hidden: false, sortable: true, dataIndex: 'amt' },
                                             { id: 'total', header: 'GRANDTOTAL', width: 70, hidden: false, sortable: true, dataIndex: 'total' },
                                             { id: 'isWeekDayExpr', header: 'WEEKDAY', width: 70, hidden: false, sortable: true, dataIndex: 'isWeekDayExpr' },
                                             { id: 'btotal', header: 'BRANCH TOTAL', width: 100, hidden: false, sortable: true, dataIndex: 'btotal' },
                                             {
                                                 id: 'Htotal', header: 'H/O TOTAL', width: 100, hidden: false, sortable: true, dataIndex: 'Htotal',
                                                 editor: {
                                                     xtype: 'combo', allowBlank: false, forceSelection: true, typeAhead: true, mode: 'local', store: ['Authorized','Not Authorized']
                                                 }
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
                                        id: '', text: 'Authorized by H/O',
                                        listeners: {
                                            'click': function (btn) {
                                                if (Ext.getCmp('grdCollAuthorization').getStore().getCount() > 0 && Ext.getCmp('frmCollAuthorization').getForm().isValid()) {
                                                    var ee = Ext.getCmp('grdCollAuthorization').getStore().getRange();
                                                    var ddte = [];
                                                    $.each(ee, function (i, d) {                                                        
                                                        ddte[i] = [d.data.Id, d.data.Htotal];                          
                                                    });
                                                    console.info(ddte);

                                                    $.ajax({
                                                        dataType: 'json',
                                                        url: '/Upload/ApproveMonthlyCollection',
                                                        contentType: 'application/json;charset=utf-8',
                                                        traditional: true,
                                                        data: {
                                                            items: ddte
                                                        },
                                                        success: function (data, status, xhttp) {
                                                            if (data.status.toString() == "true") {
                                                                Ext.Msg.alert('AUTHORIZE BRANCH PICKUP', data.msg.toString(), this);
                                                                Ext.getCmp('grdCollAuthorization').getStore().removeAll();
                                                            }
                                                            if (data.status.toString() == "false") {

                                                            }
                                                        },
                                                        error: function (data, status, xhttp) {

                                                        }
                                                    });

                                                }
                                            }
                                        }
                                    },
                                    {
                                        id: '', text: 'Download Report',
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
                title: 'SPECIE VERIFICATION', defaults: { xtype: 'panel', frame: true, border: true }, height: 700, layout: 'column',
                items: [
                    {
                        columnWidth: .2, defaults: { xtype: 'form', frame: true, border: true }, layout: 'form',
                        items: [
                            {
                                id: '', title: 'Branch Approved',
                                items: [
                                    new Ext.grid.GridPanel({
                                        id: 'grdSpecieApproved', title: '', height: 250, autoScroll: true, autoExpandColumn: 'processName',
                                        store: new Ext.data.GroupingStore({
                                            reader: new Ext.data.ArrayReader({}, [
                                                { name: 'Id', type: 'int' },
                                                { name: 'processName', type: 'string' }
                                            ]),
                                            sortInfo: {
                                                field: "processName",
                                                direction: "ASC"
                                            },
                                            groupField: "processName"
                                        }),
                                        columns: [
                                             { id: 'Id', header: 'ID', width: 25, hidden: true, sortable: true, dataIndex: 'Id' },
                                             { id: 'processName', header: 'FILE', width: 250, hidden: false, sortable: true, dataIndex: 'processName' },
                                        ], stripeRows: true,
                                        viewConfig: {
                                            getRowClass: function (record, rowIndex, rowParams, store) {
                                                return ((rowIndex % 2) == 0) ? "even-class" : "odd-class";
                                            }
                                        },
                                        listeners: {
                                            'render': function () {
                                                getProcessNames(Ext.getCmp('grdSpecieApproved'), 'SPECIEMOV', 2);
                                            },
                                            'afterrender': function () {
                                                setInterval(function () {
                                                    getProcessNames(Ext.getCmp('grdSpecieApproved'), 'SPECIEMOV', 2);
                                                }, 120000);
                                            },
                                            'rowdblclick': function (e, t) {
                                                Ext.getCmp('grdSpeciePDtaVerification').getEl().mask("Fetching data..Please wait...", "x-mask-loading");
                                                var rec = e.getStore().getAt(t);
                                                Ext.getCmp('grdSpeciePDtaVerification').getEl().unmask();
                                                QPFinder(Ext.getCmp('grdSpeciePDtaVerification'), 'SPECIEMOV', rec.get('processName'), '', '');
                                            }
                                        }
                                    })
                                ]
                            },
                            {
                                id: '', title: 'H/O Authorized',
                                items: [
                                    new Ext.grid.GridPanel({
                                        id: 'grdSpecieAuthorized', title: '', height: 300, autoScroll: true, autoExpandColumn: 'processName',
                                        store: new Ext.data.GroupingStore({
                                            reader: new Ext.data.ArrayReader({}, [
                                                { name: 'Id', type: 'int' },
                                                { name: 'processName', type: 'string' }
                                            ]),
                                            sortInfo: {
                                                field: "processName",
                                                direction: "ASC"
                                            },
                                            groupField: "processName"
                                        }),
                                        columns: [
                                             { id: 'Id', header: 'ID', width: 25, hidden: true, sortable: true, dataIndex: 'Id' },
                                             { id: 'processName', header: 'FILE', width: 250, hidden: false, sortable: true, dataIndex: 'processName' },
                                        ], stripeRows: true,
                                        viewConfig: {
                                            getRowClass: function (record, rowIndex, rowParams, store) {
                                                return ((rowIndex % 2) == 0) ? "even-class" : "odd-class";
                                            }
                                        },
                                        listeners: {
                                            'render': function () {
                                                getProcessNames(Ext.getCmp('grdSpecieAuthorized'), 'SPECIEMOV', 3);
                                            },
                                            'afterrender': function () {
                                                setInterval(function () {
                                                    getProcessNames(Ext.getCmp('grdSpecieAuthorized'), 'SPECIEMOV', 3);
                                                }, 120000);
                                            },
                                            'rowdblclick': function (e, t) {
                                                Ext.getCmp('grdSpeciePDtaVerification').getEl().mask("Fetching data..Please wait...", "x-mask-loading");
                                                var rec = e.getStore().getAt(t);
                                                Ext.getCmp('grdSpeciePDtaVerification').getEl().unmask();
                                                QPFinder(Ext.getCmp('grdSpeciePostVerification'), 'SPECIEMOV', rec.get('processName'), '', '');
                                            }
                                        }
                                    })
                                ]
                            }
                        ]
                    },
                    {
                        columnWidth:.8, defaults: { xtype: 'form', frame: true, border: true, collapsible: true }, layout: 'form',
                        items: [
                            {
                                id: '',title: 'Pre-Verification',
                                items: [
                                    new Ext.grid.GridPanel({
                                        id: 'grdSpeciePDtaVerification', title: '', height: 250, autoScroll: true, autoExpandColumn: 'branch',
                                        plugins: [specieP_authorized_editor],
                                        store: new Ext.data.GroupingStore({
                                            reader: new Ext.data.ArrayReader({}, [
                                                { name: 'Id', type: 'int' },
                                                { name: 'branch', type: 'string' },
                                                { name: 'tripFrom', type: 'string' },
                                                { name: 'tripTo', type: 'string' },
                                                { name: 'Milage', type: 'string' },
                                                { name: 'FrequencyOfTrip', type: 'string' },
                                                { name: 'RevenueFromRate', type: 'string' },
                                                { name: 'NIBRevInput', type: 'string' },
                                                { name: 'HORevInput', type: 'string' }
                                            ]),
                                            sortInfo: {
                                                field: "branch",
                                                direction: "ASC"
                                            },
                                            groupField: "branch"
                                        }),
                                        columns: [
                                             { id: 'Id', header: 'ID', width: 25, hidden: true, sortable: true, dataIndex: 'Id' },
                                             { id: 'branch', header: 'COMPANY', width: 100, hidden: false, sortable: true, dataIndex: 'branch' },
                                             { id: 'tripFrom', header: 'ROUTE FROM', width: 150, hidden: false, sortable: true, dataIndex: 'tripFrom' },
                                             { id: 'tripTo', header: 'ROUTE TO', width: 150, hidden: false, sortable: true, dataIndex: 'tripTo' },
                                             {
                                                 id: 'Milage', header: 'MILAGE', width: 100, hidden: false, sortable: true, dataIndex: 'Milage'
                                             },
                                             {
                                                 id: 'FrequencyOfTrip', header: 'FREQUENCY', width: 100, hidden: false, sortable: true, dataIndex: 'FrequencyOfTrip'
                                             },
                                             { id: 'RevenueFromRate', header: 'ACCRUED REVENUE', width: 100, hidden: false, sortable: true, dataIndex: 'RevenueFromRate' },
                                             {
                                                 id: 'NIBRevInput', header: 'NIB INPUT', width: 150, hidden: false, sortable: true, dataIndex: 'NIBRevInput'
                                             },
                                             {
                                                 id: 'HORevInput', header: 'H/O INPUT', width: 150, hidden: false, sortable: true, dataIndex: 'HORevInput',
                                                 editor: {
                                                     xtype: 'combo', forceSelection: true, typeAhead: true, mode: 'local', store: ['Authorized','Not Authorized']
                                                 }
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
                                        id: '', text: 'Analyze Milage Data',
                                        listeners: {
                                            'click': function (btn) {
                                                $.post('/Home/analyzeSpecieMilageData', {}, function (rs) {
                                                    if (rs.status.toString() == "true") {
                                                        var dd = [];
                                                        var dta = [];
                                                        $.each(rs.msg, function (i, d) {
                                                            dd[i] = [d.Id, d.objCompany.branchCode, d.objRoute.tripFrom, d.objRoute.tripTo, d.objSpecie.Milage,
                                                                d.objSpecie.FrequencyOfTrip, d.objSpecie.RevenueFromRate, d.objSpecie.branchRevenueInput, 'Authorized'];// d.objSpecie.HORevenueInput];
                                                        });

                                                        $.each(rs.extraDta, function (k, dt) {
                                                            dta[k] = [dt.Id, dt.objCompany.branchCode, dt.objRoute.tripFrom, dt.objRoute.tripTo, dt.objSpecie.Milage,
                                                                dt.objSpecie.FrequencyOfTrip, dt.objSpecie.RevenueFromRate, dt.objSpecie.branchRevenueInput, 'Authorized'];// d.objSpecie.HORevenueInput];
                                                        });
                                                        
                                                        Ext.getCmp('grdSpeciePostVerification').getStore().loadData(dd);
                                                        Ext.getCmp('grdSpecieVariance').getStore().loadData(dta);
                                                    }
                                                }, "json");
                                            }
                                        }
                                    },
                                    {
                                        id: '', text: 'Authorize',
                                        listeners: {
                                            'click': function (btn) {
                                                if (Ext.getCmp('grdSpeciePDtaVerification').getStore().getCount() > 0) {
                                                    var ee = Ext.getCmp('grdSpeciePDtaVerification').getStore().getRange();
                                                    var dt = [];
                                                    $.each(ee, function (i, d) {
                                                        if (parseFloat(d.data.HORevInput) != 0) {
                                                            dt[i] = [d.data.Id, d.data.HORevInput];
                                                        }
                                                        else {
                                                            Ext.Msg.alert('SPECIE VERIFICATION', 'Enter valid values for Revenue', this);
                                                            dt = [];
                                                            return false;
                                                        }
                                                    });

                                                    $.ajax({
                                                        dataType: 'json',
                                                        url: '/Upload/ApproveMonthlySpecieMovement',
                                                        contentType: 'application/json;charset=utf-8',
                                                        traditional: true,
                                                        data: {
                                                            items: dt
                                                        },
                                                        success: function (data, status, xhttp) {
                                                            if (data.status.toString() == "true") {
                                                                Ext.Msg.alert('SPECIE MOVEMENT AUTHORIZATION STATUS', data.msg.toString(), this);
                                                            }
                                                            if (data.status.toString() == "false") {
                                                                Ext.Msg.alert('SPECIE MOVEMENT AUTHORIZATION ERROR', data.msg.toString(), this);
                                                            }
                                                        },
                                                        error: function (data, status, xhttp) {
                                                            Ext.Msg.alert('SPECIE MOVEMENT AUTHORIZATION ERROR', data.msg.toString(), this);
                                                        }
                                                    });

                                                }
                                                else {
                                                    Ext.Msg.alert('SPECIE MOVEMENT', 'No record exist in the data store to approve', this);
                                                }
                                            }
                                        }
                                    }
                                ]
                            },
                            {
                                id: '', title: 'Post-Verification Results',height:400,
                                items: [
                                    new Ext.grid.GridPanel({
                                        id: 'grdSpeciePostVerification', title: '', height: 350, autoScroll: true, autoExpandColumn: 'branch',
                                        store: new Ext.data.GroupingStore({
                                            reader: new Ext.data.ArrayReader({}, [
                                                { name: 'Id', type: 'int' },
                                                { name: 'branch', type: 'string' },
                                                { name: 'tripFrom', type: 'string' },
                                                { name: 'tripTo', type: 'string' },
                                                { name: 'Milage', type: 'string' },
                                                { name: 'FrequencyOfTrip', type: 'string' },
                                                { name: 'RevenueFromRate', type: 'string' },
                                                { name: 'NIBRevInput', type: 'string' },
                                                { name: 'HORevInput', type: 'string' }
                                            ]),
                                            sortInfo: {
                                                field: "branch",
                                                direction: "ASC"
                                            },
                                            groupField: "branch"
                                        }),
                                        columns: [
                                             { id: 'Id', header: 'ID', width: 25, hidden: true, sortable: true, dataIndex: 'Id' },
                                             { id: 'branch', header: 'COMPANY', width: 200, hidden: false, sortable: true, dataIndex: 'branch' },
                                             { id: 'tripFrom', header: 'ROUTE FROM', width: 100, hidden: false, sortable: true, dataIndex: 'tripFrom' },
                                             { id: 'tripTo', header: 'ROUTE TO', width: 100, hidden: false, sortable: true, dataIndex: 'tripTo' },
                                             {
                                                 id: 'Milage', header: 'MILAGE', width: 100, hidden: false, sortable: true, dataIndex: 'Milage'
                                             },
                                             {
                                                 id: 'FrequencyOfTrip', header: 'FREQUENCY', width: 70, hidden: false, sortable: true, dataIndex: 'FrequencyOfTrip'
                                             },
                                             { id: 'RevenueFromRate', header: 'ACCRUED REVENUE', width: 70, hidden: false, sortable: true, dataIndex: 'RevenueFromRate' },
                                             {
                                                 id: 'NIBRevInput', header: 'NIB INPUT', width: 70, hidden: false, sortable: true, dataIndex: 'NIBRevInput'
                                             },
                                             {
                                                 id: 'HORevInput', header: 'H/O INPUT', width: 70, hidden: false, sortable: true, dataIndex: 'HORevInput'
                                             }
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
                                id: '', title: 'Beyond Acceptable Variance',height: 200, hidden: true,
                                items: [
                                    new Ext.grid.GridPanel({
                                        id: 'grdSpecieVariance', title: '', height: 150, autoScroll: true, autoExpandColumn: 'branch',
                                        store: new Ext.data.GroupingStore({
                                            reader: new Ext.data.ArrayReader({}, [
                                                { name: 'Id', type: 'int' },
                                                { name: 'branch', type: 'string' },
                                                { name: 'tripFrom', type: 'string' },
                                                { name: 'tripTo', type: 'string' },
                                                { name: 'Milage', type: 'string' },
                                                { name: 'FrequencyOfTrip', type: 'string' },
                                                { name: 'RevenueFromRate', type: 'string' },
                                                { name: 'NIBRevInput', type: 'string' },
                                                { name: 'HORevInput', type: 'string' }
                                            ]),
                                            sortInfo: {
                                                field: "branch",
                                                direction: "ASC"
                                            },
                                            groupField: "branch"
                                        }),
                                        columns: [
                                             { id: 'Id', header: 'ID', width: 25, hidden: true, sortable: true, dataIndex: 'Id' },
                                             { id: 'branch', header: 'COMPANY', width: 200, hidden: false, sortable: true, dataIndex: 'branch' },
                                             { id: 'tripFrom', header: 'ROUTE FROM', width: 100, hidden: false, sortable: true, dataIndex: 'tripFrom' },
                                             { id: 'tripTo', header: 'ROUTE TO', width: 100, hidden: false, sortable: true, dataIndex: 'tripTo' },
                                             {
                                                 id: 'Milage', header: 'MILAGE', width: 100, hidden: false, sortable: true, dataIndex: 'Milage'
                                             },
                                             {
                                                 id: 'FrequencyOfTrip', header: 'FREQUENCY', width: 70, hidden: false, sortable: true, dataIndex: 'FrequencyOfTrip'
                                             },
                                             { id: 'RevenueFromRate', header: 'ACCRUED REVENUE', width: 70, hidden: false, sortable: true, dataIndex: 'RevenueFromRate' },
                                             {
                                                 id: 'NIBRevInput', header: 'NIB INPUT', width: 70, hidden: false, sortable: true, dataIndex: 'NIBRevInput'
                                             },
                                             {
                                                 id: 'HORevInput', header: 'H/O INPUT', width: 70, hidden: false, sortable: true, dataIndex: 'HORevInput'
                                             }
                                        ], stripeRows: true,
                                        viewConfig: {
                                            getRowClass: function (record, rowIndex, rowParams, store) {
                                                return ((rowIndex % 2) == 0) ? "even-class" : "odd-class";
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
                title: 'TELLER BILLING AUTHORIZATION', defaults: { xtype: 'panel' }, layout: 'column',
                items: [
                    {
                        columnWidth: .2, defaults: { xtype: 'form', frame: true, border: true }, layout: 'form',
                        items: [
                            {
                                id: '', title: 'Branch Approved',
                                items: [
                                    new Ext.grid.GridPanel({
                                        id: 'grdTellrApproved', title: '', height: 350, autoScroll: true, autoExpandColumn: 'processName',
                                        store: new Ext.data.GroupingStore({
                                            reader: new Ext.data.ArrayReader({}, [
                                                { name: 'Id', type: 'int' },
                                                { name: 'processName', type: 'string' }
                                            ]),
                                            sortInfo: {
                                                field: "processName",
                                                direction: "ASC"
                                            },
                                            groupField: "processName"
                                        }),
                                        columns: [
                                             { id: 'Id', header: 'ID', width: 25, hidden: true, sortable: true, dataIndex: 'Id' },
                                             { id: 'processName', header: 'FILE', width: 250, hidden: false, sortable: true, dataIndex: 'processName' },
                                        ], stripeRows: true,
                                        viewConfig: {
                                            getRowClass: function (record, rowIndex, rowParams, store) {
                                                return ((rowIndex % 2) == 0) ? "even-class" : "odd-class";
                                            }
                                        },
                                        listeners: {
                                            'render': function () {
                                                $.getJSON('/Home/getDistinctTellerFilesUsingStatus', {LOAD: 1, STAT: 2}, function (rs) {
                                                    if (rs.status.toString() == "true") {
                                                        var tt = [];
                                                        $.each(rs.msg, function (i, d) {
                                                            tt[i] = [d.tellerId, d.location];
                                                        });

                                                        Ext.getCmp('grdTellrApproved').getStore().loadData(tt);
                                                    }
                                                });
                                            },
                                            'rowdblclick': function (e, t) {
                                                Ext.getCmp('grdTellrDta').getEl().mask("Fetching data..Please wait...", "x-mask-loading");

                                                var rec = e.getStore().getAt(t);
                                                $.getJSON('/Home/getTellerDetails', {CAPTION:rec.get('processName')}, function (rs) {
                                                    if (rs.status.toString() == "true") {
                                                        var rsa = [];
                                                        $.each(rs.msg, function (i, d) {
                                                            rsa[i] = [d.tellerId, d.objCompany.branchCode,d.location,d.tellerNumbers, d.tellerNames,d.tRate,d.amount,'Authorized'];
                                                        });

                                                        Ext.getCmp('grdTellrDta').getEl().unmask();
                                                        Ext.getCmp('grdTellrDta').getStore().loadData(rsa);
                                                    }
                                                });
                                            }
                                        }
                                    })
                                ]
                            },
                            {
                                id: '', title: 'H/O Authorized',
                                items: [
                                    new Ext.grid.GridPanel({
                                        id: 'grdTellrAuthorize', title: '', height: 350, autoScroll: true, autoExpandColumn: 'processName',
                                        store: new Ext.data.GroupingStore({
                                            reader: new Ext.data.ArrayReader({}, [
                                                { name: 'Id', type: 'int' },
                                                { name: 'processName', type: 'string' }
                                            ]),
                                            sortInfo: {
                                                field: "processName",
                                                direction: "ASC"
                                            },
                                            groupField: "processName"
                                        }),
                                        columns: [
                                             { id: 'Id', header: 'ID', width: 25, hidden: true, sortable: true, dataIndex: 'Id' },
                                             { id: 'processName', header: 'FILE', width: 250, hidden: false, sortable: true, dataIndex: 'processName' },
                                        ], stripeRows: true,
                                        viewConfig: {
                                            getRowClass: function (record, rowIndex, rowParams, store) {
                                                return ((rowIndex % 2) == 0) ? "even-class" : "odd-class";
                                            }
                                        },
                                        listeners: {
                                            'render': function () {
                                                $.getJSON('/Home/getDistinctTellerFilesUsingStatus', { LOAD: 1, STAT: 3 }, function (rs) {
                                                    if (rs.status.toString() == "true") {
                                                        var tt = [];
                                                        $.each(rs.msg, function (i, d) {
                                                            tt[i] = [d.tellerId, d.location];
                                                        });

                                                        Ext.getCmp('grdTellrAuthorize').getStore().loadData(tt);
                                                    }
                                                });
                                            },
                                            'rowdblclick': function (e, t) {
                                                Ext.getCmp('grdTellrDta').getEl().mask("Fetching data..Please wait...", "x-mask-loading");

                                                var rec = e.getStore().getAt(t);
                                                $.getJSON('/Home/getTellerDetails', { CAPTION: rec.get('processName') }, function (rs) {
                                                    if (rs.status.toString() == "true") {
                                                        var rsa = [];
                                                        $.each(rs.msg, function (i, d) {
                                                            rsa[i] = [d.tellerId, d.objCompany.branchCode, d.location, d.tellerNumbers, d.tellerNames, d.tRate, d.amount, 'Authorized'];
                                                        });

                                                        Ext.getCmp('grdTellrDta').getEl().unmask();
                                                        Ext.getCmp('grdTellrDta').getStore().loadData(rsa);
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
                        title: 'Teller Billing Data', columnWidth: .8, defaults: { xtype: 'form', frame: true, border: true },
                        items: [
                            {
                                id: '',
                                items: [
                                    new Ext.grid.GridPanel({
                                        id: 'grdTellrDta', title: '', height: 500, autoScroll: true, autoExpandColumn: 'branchCode',
                                        plugins: [tellr_editor],
                                        store: new Ext.data.GroupingStore({
                                            reader: new Ext.data.ArrayReader({}, [
                                                { name: 'tellerId', type: 'int' },
                                                { name: 'branchCode', type: 'string' },
                                                { name: 'location', type: 'string' },
                                                { name: 'tellerNumbers', type: 'string' },
                                                { name: 'tellerNames', type: 'string' },
                                                { name: 'tRate', type: 'string' },
                                                { name: 'amount', type: 'string' },
                                                { name: 'aprStatus', type: 'string' }
                                            ]),
                                            sortInfo: {
                                                field: "branchCode",
                                                direction: "ASC"
                                            },
                                            groupField: "branchCode"
                                        }),
                                        columns: [
                                             { id: 'tellerId', header: 'ID', width: 25, hidden: true, sortable: true, dataIndex: 'Id' },
                                             { id: 'branchCode', header: 'COMPANY', width: 150, hidden: false, sortable: true, dataIndex: 'branchCode' },
                                             { id: 'location', header: 'LOCATION', width: 200, hidden: false, sortable: true, dataIndex: 'location' },
                                             { id: 'tellerNumbers', header: 'No. OF TELLERS', width: 100, hidden: false, sortable: true, dataIndex: 'tellerNumbers' },
                                             { id: 'tellerNames', header: 'TELLER NAMES', width: 300, hidden: false, sortable: true, dataIndex: 'tellerNames' },
                                             { id: 'tRate', header: 'RATE', width: 100, hidden: false, sortable: true, dataIndex: 'tRate' },
                                             { id: 'amount', header: 'AMOUNT', width: 70, hidden: false, sortable: true, dataIndex: 'amount' },
                                             {
                                                 id: 'aprStatus', header: 'STATUS', width: 100, hidden: false, sortable: true, dataIndex: 'aprStatus',
                                                 editor: {
                                                     xtype: 'combo', forceSelection: true, typeAhead: true, allowBlank: false, mode: 'local', store: ['Authorize','Not Authorize']
                                                 }
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
                                        id: '', text: 'Authorize',
                                        listeners: {
                                            'click': function (btn) {                                                
                                                if (Ext.getCmp('grdTellrDta').getStore().getCount() > 0) {
                                                    var edt = Ext.getCmp('grdTellrDta').getStore().getRange();
                                                    var ed = [];

                                                    $.each(edt, function (i, d) {
                                                        ed[i] = [d.data.tellerId,d.data.aprStatus];
                                                    });
                                                  
                                                    $.ajax({
                                                        dataType: 'json',
                                                        url: '/Upload/AuthorizeTellerBillCollections',
                                                        contentType: 'application/json;charset=utf-8',
                                                        traditional: true,
                                                        data: {
                                                            items: ed
                                                        },
                                                        success: function (data, status, xhttp) {
                                                            Ext.Msg.alert('TELLER BILLING STATUS', data.msg.toString(), this);
                                                        },
                                                        error: function (data, status, xhttp) {
                                                            Ext.Msg.alert('TELLER BILLING ERROR', data.msg.toString(), this);
                                                        }
                                                    });
                                                }
                                                else { Ext.Msg.alert('TELLER BILLING STATUS', 'Result set is empty', this); }
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
                title: 'Staff Details', defaults: { xtype: 'panel', frame: true, border: true, height:350 }, height: 700, layout: 'column',
                items: [
                    {
                        columnWidth: .4, defaults: { xtype: 'form', frame: true, border: true },layout: 'accordion',
                        items: [
                            {
                                id: 'stentry', title: 'staff data entry Form', defaults: { xtype: 'textfield', anchor: '95%', allowBlank: false },
                                items: [
                                    {
                                        id: 'stcb', xtype: 'combo', typeAhead: true, forceSelection: true, mode: 'local',fieldLabel: 'Company',
                                        store: new Ext.data.Store({
                                            id: '', autoLoad: true, restful: false,
                                            url: '/Home/getCompanyList',
                                            reader: new Ext.data.JsonReader({root: 'msg'}, [
                                                { name: 'Id', type: 'int' },
                                                { name: 'branchName', type: 'string' }
                                            ])
                                        }),valueField: 'Id', displayField: 'branchName'
                                    },
                                    { id: 'stsno', fieldLabel: 'Staff No' },
                                    { id: 'stsn', fieldLabel: 'Surname' },
                                    { id: 'sto', fieldLabel: 'Other names' },
                                    { id: 'stcap', fieldLabel: 'Capacity' },
                                    { id: 'stem', fieldLabel: 'Email', vtype: 'email' },
                                    { id: 'stmob', fieldLabel: 'Mobile' }
                                ],
                                buttons: [
                                    {
                                        id: '', text: 'Save',
                                        listeners:
                                        {
                                            'click': function () {
                                                var stf = Ext.getCmp('stentry');
                                                if (stf.getForm().isValid()) {
                                                    var arr = [];
                                                    arr[0] = Ext.getCmp('stcb').getValue(); arr[1] = $('#stsno').val(); arr[2] = $('#stsn').val(); arr[3] = $('#sto').val();
                                                    arr[4] = $('#stcap').val(); arr[5] = $('#stem').val(); arr[6] = $('#stmob').val();

                                                    $.ajax({
                                                        dataType: 'json',
                                                        url: '/Home/saveStaffInformation',
                                                        contentType: 'application/json;charset=utf-8',
                                                        traditional: true,
                                                        data: {
                                                            items: arr
                                                        },
                                                        success: function (data, status, xhttp) {
                                                            if (data.status.toString() == "true") {
                                                                loadOfficials(Ext.getCmp('grdStfDta'));
                                                                Ext.Msg.alert('STAFF DATA ENTRY', data.msg.toString(), this);
                                                                $('#stclr').trigger('click');
                                                            }
                                                            if (data.status.toString() == "false") {
                                                                Ext.Msg.alert('STAFF DATA ENTRY', data.msg.toString(), this);
                                                            }
                                                        },
                                                        error: function (data, status, xhttp) {
                                                            Ext.Msg.alert('CHART OF ACCOUNTS', data.msg.toString(), this);
                                                        }
                                                    });
                                                }
                                            }
                                        }
                                    },
                                    {
                                        id: 'stclr', text: 'Clear',
                                        listeners: {
                                            'click': function () {
                                                Ext.getCmp('stentry').getForm().reset();
                                                $('#stsno').val('').focus();
                                            }
                                        }
                                    }
                                ]
                            },
                            {
                                id: 'stufrm', title: 'User data entry form', defaults: { xtype: 'textfield', anchor: '90%', allowBlank: false },
                                items: [
                                    { id: 'stusr', fieldLabel: 'User name' },
                                    { id: 'stact', xtype: 'combo', fieldLabel: 'isActive', forceSelection: true, typeAhead: true, mode: 'local', store: ['YES', 'NO'] },
                                    { id: 'stAD', xtype: 'combo', fieldLabel: 'usesAD', forceSelection: true, typeAhead: true, mode: 'local', store: ['YES', 'NO'] },
                                    { id: 'stADM', xtype: 'combo', fieldLabel: 'isAdmin', forceSelection: true, typeAhead: true, mode: 'local', store: ['YES', 'NO'] },
                                    { id: 'stPRO', xtype: 'combo', fieldLabel: 'Profile', forceSelection: true, typeAhead: true, mode: 'local', store: ['BRANCH_USER', 'ADM'] },
                                    {
                                        id: 'stBRO', xtype: 'combo', fieldLabel: 'Branch', forceSelection: true, typeAhead: true, mode: 'local',
                                        store: new Ext.data.Store({
                                            autoLoad: true, restful: false,
                                            url: '/Home/getCompanyList',
                                            reader: new Ext.data.JsonReader({root: 'msg'}, [
                                                { name: 'Id', type: 'int' },
                                                { name: 'branchName', type: 'string' }
                                            ])
                                        }),valueField: 'Id', displayField: 'branchName'
                                    },
                                    { id: 'stpwd', fieldLabel: 'Password', inputType: 'password' },
                                    { id: 'stpwdC', fieldLabel: 'Confirm', inputType: 'password' },
                                    {
                                        id: 'cboStNo', xtype: 'combo', fieldLabel: 'Staff No', forceSelection: true, typeAhead: true, mode: 'local',
                                        store: new Ext.data.Store({
                                            autoLoad: true, restful: false,
                                            url: '/Home/getStaffList',
                                            reader: new Ext.data.JsonReader({root:'msg'}, [
                                                { name: 'Id', type: 'int' },
                                                { name: 'staffNumber', type: 'string' }
                                            ])
                                        }), valueField: 'Id', displayField: 'staffNumber'
                                    }
                                ],
                                buttons: [
                                    {
                                        text: 'Save',
                                        listeners: {
                                            'click': function () {
                                                var stu = Ext.getCmp('stufrm').getForm();
                                                
                                                if (stu.isValid()) {
                                                    if ($('#stpwd').val() == $('#stpwdC').val()) {
                                                        var arr = [];
                                                        arr[0] = $('#stusr').val(); arr[1] = $('#stact').val(); arr[2] = $('#stAD').val(); arr[3] = $('#stADM').val();
                                                        arr[4] = $('#stPRO').val(); arr[5] = $('#stpwd').val(); arr[6] = Ext.getCmp('stBRO').getValue();
                                                        arr[7] = $('#cboStNo').val();

                                                        $.ajax({
                                                            dataType: 'json',
                                                            url: '/Home/saveUserInformation',
                                                            contentType: 'application/json;charset=utf-8',
                                                            traditional: true,
                                                            data: {
                                                                usrData: arr
                                                            },
                                                            success: function (data, status, xhttp) {
                                                                if (data.status.toString() == "true") {
                                                                    loadUsers(Ext.getCmp('grdUsrDta'));
                                                                    Ext.Msg.alert('USER DATA', data.msg.toString(), this);
                                                                    $('#stuclr').trigger('click');
                                                                }
                                                                if (data.status.toString() == "false") {
                                                                    Ext.Msg.alert('USER DATA ENTRY', data.msg.toString(), this);
                                                                }
                                                            },
                                                            error: function (data, status, xhttp) {
                                                                Ext.Msg.alert('USER DATA ENTRY', data.msg.toString(), this);
                                                            }
                                                        });
                                                    }
                                                    else {
                                                        Ext.Msg.alert('PASSWORD MISMATCH', 'Passwords entered do not match', this);
                                                    }
                                                }
                                                else { Ext.Msg.alert('INVALID INPUTS', 'Please enter all required fields', this); }
                                            }
                                        }
                                    },
                                    {
                                        id: 'stuclr',text: 'Clear',
                                        listeners: {
                                            'click': function (btn) {
                                                Ext.getCmp('stufrm').getForm().reset();
                                                $('#stusr').val('').focus();
                                            }
                                        }
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        title: 'staff Data', columnWidth: .6, defaults: { xtype: 'panel' },height:800,
                        items: [
                            {
                                defaults: { xtype: 'form', frame: true, border: true },layout: 'form',
                                items: [
                                    new Ext.grid.GridPanel({
                                        id: 'grdStfDta', autoScroll: true, autoExpandColumn: 'branchCode',height: 220,
                                        store: new Ext.data.GroupingStore({
                                            reader: new Ext.data.ArrayReader({}, [
                                                { name: 'Id', type: 'int' },
                                                { name: 'staffNumber', type: 'string' },
                                                { name: 'surname', type: 'string' },
                                                { name: 'branchCode', type: 'string' },
                                                { name: 'capacity', type: 'string' },
                                                { name: 'emailAddress', type: 'string' },
                                                { name: 'mobile', type: 'string' }
                                            ]),
                                            sortInfo: {
                                                field: "Id",
                                                direction: "ASC"
                                            },
                                            groupField: "branchCode"
                                        }),
                                        columns: [
                                             { id: 'Id', header: 'ID', width: 25, hidden: true, sortable: true, dataIndex: 'Id' },
                                             { id: 'staffNumber', header: 'STAFF No', width: 70, hidden: false, sortable: true, dataIndex: 'staffNumber' },
                                             { id: 'surname', header: 'NAME', width: 200, hidden: false, sortable: true, dataIndex: 'surname' },
                                             { id: 'branchCode', header: 'BRANCH', width: 100, hidden: false, sortable: true, dataIndex: 'branchCode' },
                                             { id: 'capacity', header: 'CAPACITY', width: 70, hidden: false, sortable: true, dataIndex: 'capacity' },
                                             { id: 'emailAddress', header: 'EMAIL', width: 70, hidden: false, sortable: true, dataIndex: 'emailAddress' },
                                             { id: 'mobile', header: 'MOBILE', width: 70, hidden: false, sortable: true, dataIndex: 'mobile' }
                                        ], stripeRows: true,
                                        viewConfig: {
                                            getRowClass: function (record, rowIndex, rowParams, store) {
                                                return ((rowIndex % 2) == 0) ? "even-class" : "odd-class";
                                            }
                                        },
                                        listeners: {
                                            'render': function () {
                                                loadOfficials(Ext.getCmp('grdStfDta'));
                                            },
                                            'afterrender': function () {
                                                setInterval(function () {
                                                    loadOfficials(Ext.getCmp('grdStfDta'));
                                                }, 120000);
                                            }
                                        }
                                    }),
                                    //user data
                                    {
                                        title: 'User data', height: 250,
                                        items: [
                                            new Ext.grid.GridPanel({
                                                id: 'grdUsrDta', autoScroll: true, autoExpandColumn: 'branchName', height: 220,
                                                store: new Ext.data.GroupingStore({
                                                    reader: new Ext.data.ArrayReader({}, [
                                                        { name: 'Id', type: 'int' },
                                                        { name: 'usr', type: 'string' },
                                                        { name: 'branchCode', type: 'string' },
                                                        { name: 'branchName', type: 'string'},
                                                        { name: 'profile', type: 'string' }
                                                    ]),
                                                    sortInfo: {
                                                        field: "Id",
                                                        direction: "ASC"
                                                    },
                                                    groupField: "branchCode"
                                                }),
                                                columns: [
                                                     { id: 'Id', header: 'ID', width: 25, hidden: true, sortable: true, dataIndex: 'Id' },
                                                     { id: 'usr', header: 'USER', width: 120, hidden: false, sortable: true, dataIndex: 'usr' },
                                                     { id: 'branchCode', header: 'BRANCH_ID', width: 100, hidden: false, sortable: true, dataIndex: 'branchCode' },
                                                     { id: 'branchName', header: 'BRANCH', width: 150, hidden: false, sortable: true, dataIndex: 'branchName' },
                                                     { id: 'profile', header: 'PROFILE', width: 70, hidden: false, sortable: true, dataIndex: 'profile' }
                                                ], stripeRows: true,
                                                viewConfig: {
                                                    getRowClass: function (record, rowIndex, rowParams, store) {
                                                        return ((rowIndex % 2) == 0) ? "even-class" : "odd-class";
                                                    }
                                                },
                                                listeners: {
                                                    'render': function () {
                                                        loadUsers(Ext.getCmp('grdUsrDta'));
                                                    },
                                                    'afterrender': function () {
                                                        setInterval(function () {
                                                            loadUsers(Ext.getCmp('grdUsrDta'));
                                                        }, 120000);
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
            },
            {
                title: 'EXCHANGE RATES TABLE', defaults: { xtype: 'panel', frame: true, border: true }, layout: 'column',
                items: [
                    {
                        columnWidth: .4, defaults: { xtype: 'panel', frame: true, border: true, collapsible: true, height: 450 }, layout: 'form',
                        items: [
                            {//start of forms array
                                title: 'Exchange Rates',defaults: { xtype: 'form', frame: true },
                                items: [
                                    {
                                        id: 'frmXchangR', title: 'Current', defaults: { xtype: 'combo', forceSelection: true, typeAhead: true, mode: 'local', allowBlank: false, anchor: '90%' },
                                        items: [
                                            {
                                                id: 'xcur',fieldLabel: 'Currency',
                                                store: new Ext.data.Store({
                                                    autoLoad: true, restful: false,
                                                    url: '/Home/getCurrencies',
                                                    reader: new Ext.data.JsonReader({type: 'json', root: 'msg'}, [
                                                        { name: 'Id', type: 'int' },
                                                        { name: 'nameOfcurrency', type: 'string' }
                                                    ])
                                                }), valueField: 'Id', displayField: 'nameOfcurrency'
                                            },
                                            { id: 'xrate', xtype: 'numberfield', fieldLabel: 'Rate', anchor: '90%' },
                                            { id: 'xdte', xtype: 'datefield', fieldLabel: 'Date', anchor: '90%', format: 'd-m-Y' }
                                        ],
                                        buttons: [
                                            {
                                                id: '', text: 'Save',
                                                listeners: {
                                                    'click': function (btn) {
                                                        if (Ext.getCmp('frmXchangR').getForm().isValid()) {
                                                            $.post('/Home/postExchangeRates',
                                                                { CUR: Ext.getCmp('xcur').getValue(), crate: Ext.fly('xrate').getValue(), dte_: Ext.fly('xdte').getValue() },
                                                                function (rs) {
                                                                    if (rs.status.toString() == "true") {
                                                                        //load grid with data
                                                                        xchangeDta(Ext.getCmp('grdXc'), 1);
                                                                        $('#xbtnClr').trigger('click');
                                                                    }
                                                                }, "json");
                                                        }
                                                        else { Ext.Msg.alert('EXCHANGE RATE', 'Please enter all valid fields', this); }
                                                    }
                                                }
                                            },
                                            {
                                                id: 'xbtnClr', text: 'Clear',
                                                listeners: {
                                                    'click': function (btn) {
                                                        Ext.getCmp('frmXchangR').getForm().reset();
                                                    }
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        id: '', title: 'Current Exchange List',
                                        items: [
                                            new Ext.grid.GridPanel({
                                                id: 'grdXc', autoScroll: true, autoExpandColumn: 'nameOfcurrency', height: 220,
                                                store: new Ext.data.GroupingStore({
                                                    reader: new Ext.data.ArrayReader({}, [
                                                        { name: 'Id', type: 'int' },
                                                        { name: 'nameOfcurrency', type: 'string' },
                                                        { name: 'symbolOfcurrency', type: 'string' },
                                                        { name: 'x_rate', type: 'string' },
                                                        { name: 'dte', type: 'string' }
                                                    ]),
                                                    sortInfo: {
                                                        field: "Id",
                                                        direction: "ASC"
                                                    },
                                                    groupField: "nameOfcurrency"
                                                }),
                                                columns: [
                                                     { id: 'Id', header: 'ID', width: 25, hidden: true, sortable: true, dataIndex: 'Id' },
                                                     { id: 'nameOfcurrency', header: 'CURRENCY', width: 120, hidden: false, sortable: true, dataIndex: 'nameOfcurrency' },
                                                     { id: 'symbolOfcurrency', header: 'SYMBOL', width: 120, hidden: false, sortable: true, dataIndex: 'symbolOfcurrency' },
                                                     { id: 'x_rate', header: 'RATE', width: 100, hidden: false, sortable: true, dataIndex: 'x_rate' },
                                                     { id: 'dte', header: 'DATE', width: 150, hidden: true, sortable: true, dataIndex: 'dte' }
                                                ], stripeRows: true,
                                                viewConfig: {
                                                    getRowClass: function (record, rowIndex, rowParams, store) {
                                                        return ((rowIndex % 2) == 0) ? "even-class" : "odd-class";
                                                    }
                                                },
                                                listeners: {
                                                    'render': function () {
                                                        xchangeDta(Ext.getCmp('grdXc'), 1);
                                                    }
                                                }
                                            })
                                        ]
                                    }
                                ]                                     
                            },
                            //{ title: 'PICKUP RATES' }
                        ]
                    },
                    {
                        defaults: { xtype: 'panel', frame: true, collapsible: true },columnWidth: .6, title: 'Historical Rates',
                        items: [
                            {
                                defaults: { xtype: 'form', frame: true, border: true }, layout: 'form',
                                items: [
                                    {
                                        id: '',
                                        items: [
                                            new Ext.grid.GridPanel({
                                                id: 'grdPastXc', autoScroll: true, autoExpandColumn: 'nameOfcurrency', height: 220,
                                                store: new Ext.data.GroupingStore({
                                                    reader: new Ext.data.ArrayReader({}, [
                                                        { name: 'Id', type: 'int' },
                                                        { name: 'nameOfcurrency', type: 'string' },
                                                        { name: 'symbolOfcurrency', type: 'string' },
                                                        { name: 'x_rate', type: 'string' },
                                                        { name: 'dte', type: 'string' }
                                                    ]),
                                                    sortInfo: {
                                                        field: "Id",
                                                        direction: "ASC"
                                                    },
                                                    groupField: "nameOfcurrency"
                                                }),
                                                columns: [
                                                     { id: 'Id', header: 'ID', width: 25, hidden: true, sortable: true, dataIndex: 'Id' },
                                                     { id: 'nameOfcurrency', header: 'CURRENCY', width: 120, hidden: false, sortable: true, dataIndex: 'nameOfcurrency' },
                                                     { id: 'symbolOfcurrency', header: 'SYMBOL', width: 120, hidden: false, sortable: true, dataIndex: 'symbolOfcurrency' },
                                                     { id: 'x_rate', header: 'RATE', width: 100, hidden: false, sortable: true, dataIndex: 'x_rate' },
                                                     { id: 'dte', header: 'DATE', width: 150, hidden: false, sortable: true, dataIndex: 'dte' }
                                                ], stripeRows: true,
                                                viewConfig: {
                                                    getRowClass: function (record, rowIndex, rowParams, store) {
                                                        return ((rowIndex % 2) == 0) ? "even-class" : "odd-class";
                                                    }
                                                },
                                                listeners: {
                                                    'render': function () {
                                                        xchangeDta(Ext.getCmp('grdPastXc'), 0);
                                                    },
                                                    'afterrender': function () {
                                                        setInterval(function () {
                                                            xchangeDta(Ext.getCmp('grdPastXc'), 0);
                                                        }, 30000);
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
            },

            //additions to the panel comes here
            {
                title: 'DHL DATA', defaults: { xtype: 'panel' }, layout: 'column',
                items: [
                    {
                        columnWidth: .3, defaults: { xtype: 'form', frame: true, border: true, height: 500 }, layout: 'form',
                        items: [
                            { id: 'DHLFrm', title: 'DHL Upload Form', height: 150, fileUpload: true, defaults: { anchor: '100%', allowBlank: false, msgTarget: 'side' },
                                bodyStyle: 'padding: 5px 5px 0 5px;', labelWidth: 50,
                                items: [
                                    { id: 'DHLName', xtype: 'textfield', fieldLabel: 'Name', anchor: '95%' },
                                    {
                                        id: 'DHL-name', xtype: 'fileuploadfield', fieldLabel: 'File', name: 'DHL-name', buttonText: '...', buttonCfg: {
                                            iconCls: 'upload-icon'
                                        }
                                    }
                                ],
                                buttons: [
                                    {
                                        id: '', text: 'Save',
                                        listeners: {
                                            'click': function () {
                                                var tlF = Ext.getCmp('DHLFrm');
                                                if (tlF.getForm().isValid()) {
                                                    tlF.getForm().submit({
                                                        url: '/Upload/UploadDHLSourceData',
                                                        waitMsg: 'Uploading your DHL Template file...',
                                                        standardSubmit: true,
                                                        params: { caption: Ext.fly('DHLName').getValue() },
                                                        success: function (form, action) {
                                                            var data = JSON.parse(action.response.responseText);
                                                            if (data.success.toString() == "true") {
                                                                loadIASPreviewDta(data.good, Ext.getCmp('grdDHLPreview'));
                                                                //loadTELLRPreviewData(data.good, Ext.getCmp('grdBillPreview'));
                                                                getProcessList('DHL', Ext.getCmp('grdDHLLogs'));
                                                                IAS_REKORD = Ext.fly('DHLName').getValue();
                                                            }
                                                        },
                                                        failure: function (form, action) {
                                                            //var dta = JSON.parse(action.response.responseText);
                                                            //Ext.Msg.alert('SAVE DHL DATA', 'An error occured', this);

                                                        }
                                                    });
                                                }
                                            }
                                        }
                                    },
                                    {
                                        id: '', text: 'Reset',
                                        handler: function (btn) {
                                            Ext.getCmp('IASFrm').getForm().reset();
                                            $('#IASName').focus();
                                        }
                                    }
                                ]
                            },
                            {
                                id: '', title: 'DHL Upload Logs',
                                items: [
                                    new Ext.grid.GridPanel({
                                        id: 'grdDHLLogs', title: '', height: 350, autoScroll: true, autoExpandColumn: 'processName',
                                        store: new Ext.data.GroupingStore({
                                            reader: new Ext.data.ArrayReader({}, [
                                                { name: 'Id', type: 'int' },
                                                { name: 'processType', type: 'string' },
                                                { name: 'processName', type: 'string' }
                                            ]),
                                            sortInfo: {
                                                field: "Id",
                                                direction: "ASC"
                                            },
                                            groupField: "processName"
                                        }),
                                        columns: [
                                             { id: 'Id', header: 'ID', width: 25, hidden: true, sortable: true, dataIndex: 'Id' },
                                             { id: 'processType', header: 'PROCESSTYPE', width: 200, hidden: true, sortable: true, dataIndex: 'processType' },
                                             { id: 'processName', header: 'FILE', width: 200, hidden: false, sortable: true, dataIndex: 'processName' }
                                        ], stripeRows: true,
                                        viewConfig: {
                                            getRowClass: function (record, rowIndex, rowParams, store) {
                                                return ((rowIndex % 2) == 0) ? "even-class" : "odd-class";
                                            }
                                        },
                                        listeners: {
                                            'render': function () {
                                                getProcessList('DHL', Ext.getCmp('grdDHLLogs'));
                                            },
                                            'afterrender': function () {
                                                setInterval(function () {
                                                    getProcessList('DHL', Ext.getCmp('grdDHLLogs'));
                                                }, 120000);
                                            },
                                            'rowdblclick': function (e, t) {
                                                var rec = e.getStore().getAt(t);
                                                DHL_REKORD = rec.get('processName');
                                                $.getJSON('/Home/getDHLDataUsingFileName', { Fn: rec.get('processName') }, function (r) {
                                                    if (r.status.toString() == "true") {
                                                        var ar = [];
                                                        $.each(r.msg, function (i, d) {
                                                            ar[i] = [d.Id, d.objCompany.branchCode, d.AirWayBillNo, d.Shipper, d.Receipient, d.WeightInKilograms, d.AirwayBillDateString, d.Charge, d.Discount, d.SubTotal,
                                                                        d.VAT, d.NationalHealthLevy, d.NetAmount, d.Insurance, d.GrandTotal];
                                                        });

                                                        Ext.getCmp('grdDHLPreview').getStore().loadData(ar);
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
                        columnWidth: .7, defaults: { xtype: 'form', frame: true, border: true, height: 700 }, layout: 'fit',
                        items: [
                            {
                                id: '', title: 'DHL Data',
                                items: [
                                    new Ext.grid.GridPanel({
                                        id: 'grdDHLPreview', title: '', height: 650, autoScroll: true, autoExpandColumn: 'branchCode',
                                        store: new Ext.data.GroupingStore({
                                            reader: new Ext.data.ArrayReader({}, [
                                                { name: 'Id', type: 'int' },
                                                { name: 'branchCode', type: 'string' },
                                                { name: 'AirWayBillNo', type: 'string' },
                                                { name: 'Shipper', type: 'string' },
                                                { name: 'Receipient', type: 'string' },
                                                { name: 'WeightInKilograms', type: 'string' },
                                                { name: 'AirwayBillDate', type: 'date', format: 'd/M/Y' },
                                                { name: 'Charge', type: 'string' },
                                                { name: 'Discount', type: 'string' },
                                                { name: 'SubTotal', type: 'string' },
                                                { name: 'VAT', type: 'string' },
                                                { name: 'NationalHealthLevy', type: 'string' },
                                                { name: 'NetAmount', type: 'string' },
                                                { name: 'Insurance', type: 'string' },
                                                { name: 'GrandTotal', type: 'string' }
                                            ]),
                                            sortInfo: {
                                                field: "Id",
                                                direction: "ASC"
                                            },
                                            groupField: "Id"
                                        }),
                                        columns: [
                                             { id: 'Id', header: 'ID', width: 25, hidden: true, sortable: true, dataIndex: 'Id' },
                                             { id: 'branchCode', header: 'BRANCH', width: 150, hidden: false, sortable: true, dataIndex: 'branchCode' },
                                             { id: 'AirWayBillNo', header: 'BILL', width: 150, hidden: false, sortable: true, dataIndex: 'AirWayBillNo' },
                                             { id: 'Shipper', header: 'SHIPPER', width: 150, hidden: false, sortable: true, dataIndex: 'Shipper' },
                                             { id: 'Receipient', header: 'RECEIPIENT', width: 70, hidden: false, sortable: true, dataIndex: 'Receipient' },
                                             { id: 'WeightInKilograms', header: 'WEIGHT(Kg)', width: 70, hidden: false, sortable: true, dataIndex: 'WeightInKilograms' },
                                             { id: 'AirwayBillDate', header: 'BILL DATE', width: 90, hidden: false, sortable: true, dataIndex: 'AirwayBillDate', xtype: 'datecolumn', format: 'd/M/Y' },
                                             { id: 'Charge', header: 'CHARGE', width: 100, hidden: false, sortable: true, dataIndex: 'Charge' },
                                             { id: 'Discount', header: 'DISBOUNT', width: 70, hidden: false, sortable: true, dataIndex: 'Discount' },
                                             { id: 'SubTotal', header: 'SUB-TOTAL', width: 70, hidden: false, sortable: true, dataIndex: 'SubTotal' },
                                             { id: 'VAT', header: 'VAT', width: 70, hidden: false, sortable: true, dataIndex: 'VAT' },
                                             { id: 'NationalHealthLevy', header: 'NHIS', width: 70, hidden: false, sortable: true, dataIndex: 'NationalHealthLevy' },
                                             { id: 'NetAmount', header: 'NET-AMOUNT', width: 70, hidden: false, sortable: true, dataIndex: 'NetAmount' },
                                             { id: 'Insurance', header: 'INSURANCE', width: 70, hidden: false, sortable: true, dataIndex: 'Insurance' },
                                             { id: 'GrandTotal', header: 'TOTAL', width: 70, hidden: false, sortable: true, dataIndex: 'GrandTotal' }
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
                                        text: 'Commit',
                                        handler: function (btn) {
                                            if (Ext.getCmp('grdDHLPreview').getStore().getCount() > 0) {
                                                $.post('/Upload/PersistDHLCorrectData', { UPL: DHL_REKORD }, function (rs) {
                                                    if (rs.status.toString() == "true") {
                                                        Ext.Msg.alert('DHL COMMIT STATUS', DHL_REKORD + ' committed successfully to datastore', this);
                                                        DHL_REKORD = '';
                                                    }
                                                    else { Ext.Msg.alert('DHL COMMIT STATUS', rs.msg.toString(), this); }
                                                }, "json");
                                            }
                                            else { Ext.Msg.alert('DHL COMMIT STATUS', 'Empty Data set', this); }
                                        }
                                    },
                                    {
                                        text: 'Delete DHL Upload',
                                        handler: function (btn) {
                                            if (Ext.getCmp('grdDHLPreview').getStore().getCount() > 0) {
                                                $.post('/Upload/DeleteDHILData', { UPL: IAS_REKORD }, function (r) {
                                                    if (r.status.toString() == "true") {
                                                        Ext.Msg.alert('DHL DELETE STATUS', IAS_REKORD + ' deleted successfully from datastore', this);
                                                        Ext.getCmp('grdDHLPreview').getStore().removeAll();
                                                        getProcessList('DHL', Ext.getCmp('grdIASLogs'));
                                                        DHL_REKORD = '';
                                                    }
                                                    else { Ext.Msg.alert('DHL DELETE STATUS', r.msg.toString(), this); }
                                                }, "json");
                                            }
                                            else { Ext.Msg.alert('DHL DELETE STATUS', 'Empty Data Set', this); }
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                title: 'IAS FEDEX DATA', defualts: { xtype: 'panel' }, layout: 'column',
                items: [
                    {
                        columnWidth: .3, defaults: { xtype: 'form', frame: true, border: true, height: 500 }, layout: 'form',
                        items: [
                            {
                                id: 'IASFrm', title: 'IAS Data Upload', height: 120, fileUpload: true, defaults: { anchor: '100%', allowBlank: false, msgTarget: 'side' },
                                bodyStyle: 'padding: 5px 5px 0 5px;', labelWidth: 50,
                                items: [
                                    { id: 'IASName', xtype: 'textfield', fieldLabel: 'Name', anchor: '95%' },
                                    {
                                        id: 'IAS-name', xtype: 'fileuploadfield', fieldLabel: 'File', name: 'IAS-name', buttonText: '...', buttonCfg: {
                                            iconCls: 'upload-icon'
                                        }
                                    }
                                ],
                                buttons: [
                                    {
                                        id: '', text: 'Save',
                                        listeners: {
                                            'click': function () {
                                                var tlF = Ext.getCmp('IASFrm');
                                                if (tlF.getForm().isValid()) {
                                                    tlF.getForm().submit({
                                                        url: '/Upload/UploadDHLData',
                                                        waitMsg: 'Uploading your DHL Template file...',
                                                        standardSubmit: true,
                                                        params: { caption: Ext.fly('IASName').getValue() },
                                                        success: function (form, action) {
                                                            var data = JSON.parse(action.response.responseText);
                                                            if (data.success.toString() == "true") {
                                                                loadIASPreviewDta(data.good, Ext.getCmp('grdIASPreview'));
                                                                //loadTELLRPreviewData(data.good, Ext.getCmp('grdBillPreview'));
                                                                getProcessList('IAS', Ext.getCmp('grdIASLogs'));
                                                                IAS_REKORD = Ext.fly('IASName').getValue();
                                                            }
                                                        },
                                                        failure: function (form, action) {
                                                            //var dta = JSON.parse(action.response.responseText);
                                                            //Ext.Msg.alert('SAVE DHL DATA', 'An error occured', this);
                                                            
                                                        }
                                                    });
                                                }
                                            }
                                        }
                                    },
                                    {
                                        id: '', text: 'Reset',
                                        handler: function (btn) {
                                            Ext.getCmp('IASFrm').getForm().reset();
                                            $('#IASName').focus();
                                        }
                                    }
                                ]
                            },
                            {
                                id: '', title: 'IAS Upload Logs',
                                items: [
                                    new Ext.grid.GridPanel({
                                        id: 'grdIASLogs', title: '', height: 350, autoScroll: true, autoExpandColumn: 'processName',
                                        store: new Ext.data.GroupingStore({
                                            reader: new Ext.data.ArrayReader({}, [
                                                { name: 'Id', type: 'int' },
                                                { name: 'processType', type: 'string' },
                                                { name: 'processName', type: 'string' }
                                            ]),
                                            sortInfo: {
                                                field: "Id",
                                                direction: "ASC"
                                            },
                                            groupField: "processName"
                                        }),
                                        columns: [
                                             { id: 'Id', header: 'ID', width: 25, hidden: true, sortable: true, dataIndex: 'Id' },
                                             { id: 'processType', header: 'PROCESSTYPE', width: 200, hidden: true, sortable: true, dataIndex: 'processType' },
                                             { id: 'processName', header: 'FILE', width: 200, hidden: false, sortable: true, dataIndex: 'processName' }
                                        ], stripeRows: true,
                                        viewConfig: {
                                            getRowClass: function (record, rowIndex, rowParams, store) {
                                                return ((rowIndex % 2) == 0) ? "even-class" : "odd-class";
                                            }
                                        },
                                        listeners: {
                                            'render': function () {
                                                getProcessList('IAS', Ext.getCmp('grdIASLogs'));
                                            },
                                            'afterrender': function () {
                                                setInterval(function () {
                                                    getProcessList('IAS', Ext.getCmp('grdIASLogs'));
                                                }, 120000);
                                            },
                                            'rowdblclick': function (e,t) {
                                                var rec = e.getStore().getAt(t);
                                                IAS_REKORD = rec.get('processName');
                                                $.getJSON('/Home/getDHLUsingFileName', { Fn: rec.get('processName') }, function (r) {
                                                    if (r.status.toString() == "true") {
                                                        var ar = [];
                                                        $.each(r.msg, function (i, d) {
                                                            ar[i] = [d.Id, d.objCompany.branchCode, d.AirWayBillNo, d.Shipper, d.Receipient, d.WeightInKilograms, d.AirwayBillDateString, d.Charge, d.Discount, d.SubTotal,
                                                                        d.VAT, d.NationalHealthLevy, d.NetAmount, d.Insurance, d.GrandTotal];
                                                        });

                                                        Ext.getCmp('grdIASPreview').getStore().loadData(ar);
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
                        columnWidth: .7, defaults: { xtype: 'form', frame: true, border: true, height: 700 }, layout: 'fit',
                        items: [
                            {
                                id: '', title: 'IAS Data',
                                items: [
                                    new Ext.grid.GridPanel({
                                        id: 'grdIASPreview', title: '', height: 650, autoScroll: true, autoExpandColumn: 'branchCode',
                                        store: new Ext.data.GroupingStore({
                                            reader: new Ext.data.ArrayReader({}, [
                                                { name: 'Id', type: 'int' },
                                                { name: 'branchCode', type: 'string' },
                                                { name: 'AirWayBillNo', type: 'string' },
                                                { name: 'Shipper', type: 'string' },
                                                { name: 'Receipient', type: 'string' },
                                                { name: 'WeightInKilograms', type: 'string' },
                                                { name: 'AirwayBillDate', type: 'date', format: 'd/M/Y' },
                                                { name: 'Charge', type: 'string' },
                                                { name: 'Discount', type: 'string' },
                                                { name: 'SubTotal', type: 'string' },
                                                { name: 'VAT', type: 'string' },
                                                { name: 'NationalHealthLevy', type: 'string' },
                                                { name: 'NetAmount', type: 'string' },
                                                { name: 'Insurance', type: 'string' },
                                                { name: 'GrandTotal', type: 'string' }
                                            ]),
                                            sortInfo: {
                                                field: "Id",
                                                direction: "ASC"
                                            },
                                            groupField: "Id"
                                        }),
                                        columns: [
                                             { id: 'Id', header: 'ID', width: 25, hidden: true, sortable: true, dataIndex: 'Id' },
                                             { id: 'branchCode', header: 'BRANCH', width: 150, hidden: false, sortable: true, dataIndex: 'branchCode' },
                                             { id: 'AirWayBillNo', header: 'BILL', width: 150, hidden: false, sortable: true, dataIndex: 'AirWayBillNo' },
                                             { id: 'Shipper', header: 'SHIPPER', width: 150, hidden: false, sortable: true, dataIndex: 'Shipper' },
                                             { id: 'Receipient', header: 'RECEIPIENT', width: 70, hidden: false, sortable: true, dataIndex: 'Receipient' },
                                             { id: 'WeightInKilograms', header: 'WEIGHT(Kg)', width: 70, hidden: false, sortable: true, dataIndex: 'WeightInKilograms' },
                                             { id: 'AirwayBillDate', header: 'BILL DATE', width: 90, hidden: false, sortable: true, dataIndex: 'AirwayBillDate', xtype: 'datecolumn', format: 'd/M/Y' },
                                             { id: 'Charge', header: 'CHARGE', width: 100, hidden: false, sortable: true, dataIndex: 'Charge' },
                                             { id: 'Discount', header: 'DISBOUNT', width: 70, hidden: false, sortable: true, dataIndex: 'Discount' },
                                             { id: 'SubTotal', header: 'SUB-TOTAL', width: 70, hidden: false, sortable: true, dataIndex: 'SubTotal' },
                                             { id: 'VAT', header: 'VAT', width: 70, hidden: false, sortable: true, dataIndex: 'VAT' },
                                             { id: 'NationalHealthLevy', header: 'NHIS', width: 70, hidden: false, sortable: true, dataIndex: 'NationalHealthLevy' },
                                             { id: 'NetAmount', header: 'NET-AMOUNT', width: 70, hidden: false, sortable: true, dataIndex: 'NetAmount' },
                                             { id: 'Insurance', header: 'INSURANCE', width: 70, hidden: false, sortable: true, dataIndex: 'Insurance' },
                                             { id: 'GrandTotal', header: 'TOTAL', width: 70, hidden: false, sortable: true, dataIndex: 'GrandTotal' }
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
                                        text: 'Commit',
                                        handler: function (btn) {
                                            if (Ext.getCmp('grdIASPreview').getStore().getCount() > 0) {
                                                $.post('/Upload/PersistDHLData', { UPL: IAS_REKORD }, function (rs) {
                                                    if (rs.status.toString() == "true") {
                                                        Ext.Msg.alert('IAS COMMIT STATUS', IAS_REKORD + ' committed successfully to datastore', this);
                                                        IAS_REKORD = '';
                                                    }
                                                    else { Ext.Msg.alert('IAS COMMIT STATUS', rs.msg.toString(), this); }
                                                }, "json");
                                            }
                                            else { Ext.Msg.alert('IAS COMMIT STATUS', 'Empty Data set', this); }
                                        }
                                    },
                                    {
                                        text: 'Delete IAS Upload',
                                        handler: function (btn) {
                                            if (Ext.getCmp('grdIASPreview').getStore().getCount() > 0) {
                                                $.post('/Upload/DeleteDHILData', {UPL : IAS_REKORD}, function (r) {
                                                    if (r.status.toString() == "true") {
                                                        Ext.Msg.alert('IAS DELETE STATUS', IAS_REKORD + ' deleted successfully from datastore', this);
                                                        Ext.getCmp('grdIASPreview').getStore().removeAll();
                                                        getProcessList('IAS', Ext.getCmp('grdIASLogs'));
                                                        IAS_REKORD = '';
                                                    }
                                                    else { Ext.Msg.alert('IAS DELETE STATUS', r.msg.toString(), this); }
                                                },"json");
                                            }
                                            else { Ext.Msg.alert('IAS DELETE STATUS', 'Empty Data Set', this); }
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                title: 'IAS FEDERAL EXPRESS', defaults: { xtype: 'panel' }, layout: 'column',
                items: [
                    {
                        columnWidth: .2, defaults: { xtype: 'form', frame: true, border: true, height: 350 },
                        items: [
                            {
                                id: '', title: 'Branch Approved',
                                items: [
                                    new Ext.grid.GridPanel({
                                        id: 'grdIASApproved', title: '', height: 350, autoScroll: true, autoExpandColumn: 'processName',
                                        store: new Ext.data.GroupingStore({
                                            reader: new Ext.data.ArrayReader({}, [
                                                { name: 'Id', type: 'int' },
                                                { name: 'processName', type: 'string' }
                                            ]),
                                            sortInfo: {
                                                field: "processName",
                                                direction: "ASC"
                                            },
                                            groupField: "processName"
                                        }),
                                        columns: [
                                             { id: 'Id', header: 'ID', width: 25, hidden: true, sortable: true, dataIndex: 'Id' },
                                             { id: 'processName', header: 'FILE', width: 250, hidden: false, sortable: true, dataIndex: 'processName' },
                                        ], stripeRows: true,
                                        viewConfig: {
                                            getRowClass: function (record, rowIndex, rowParams, store) {
                                                return ((rowIndex % 2) == 0) ? "even-class" : "odd-class";
                                            }
                                        },
                                        listeners: {
                                            'render': function () {
                                                loadUnAuthorizedFedexData(1, 2, Ext.getCmp('grdIASApproved'));
                                            },
                                            'afterrender': function () {
                                                setInterval(function () {
                                                    loadUnAuthorizedFedexData(1, 2, Ext.getCmp('grdIASApproved'));
                                                }, 30000);
                                            },
                                            'rowdblclick': function (e, t) {
                                                Ext.getCmp('grdIASAuthorizedDta').getEl().mask("Fetching data..Please wait...", "x-mask-loading");

                                                var rek = e.getStore().getAt(t);
                                                $.getJSON('/Home/getDHLUsingFileName', { Fn: rek.get('processName') }, function (r) {
                                                    if (r.status.toString() == "true") {
                                                        var ar = [];
                                                        $.each(r.msg, function (i, d) {
                                                            ar[i] = [d.Id, d.objCompany.branchCode, d.AirWayBillNo, d.Shipper, d.Receipient, d.WeightInKilograms, d.AirwayBillDateString, d.Charge, d.Discount, d.SubTotal,
                                                                        d.VAT, d.NationalHealthLevy, d.NetAmount, d.Insurance, d.GrandTotal,'Authorized'];
                                                        });

                                                        Ext.getCmp('grdIASAuthorizedDta').getEl().unmask();
                                                        Ext.getCmp('grdIASAuthorizedDta').getStore().loadData(ar);
                                                    }
                                                });
                                            }
                                        }
                                    })
                                ]
                            },
                            {
                                id: '', title: 'H/O Authorized',
                                items: [
                                    new Ext.grid.GridPanel({
                                        id: 'grdIASAuthorized', title: '', height: 350, autoScroll: true, autoExpandColumn: 'processName',
                                        store: new Ext.data.GroupingStore({
                                            reader: new Ext.data.ArrayReader({}, [
                                                { name: 'Id', type: 'int' },
                                                { name: 'processName', type: 'string' }
                                            ]),
                                            sortInfo: {
                                                field: "processName",
                                                direction: "ASC"
                                            },
                                            groupField: "processName"
                                        }),
                                        columns: [
                                             { id: 'Id', header: 'ID', width: 25, hidden: true, sortable: true, dataIndex: 'Id' },
                                             { id: 'processName', header: 'FILE', width: 250, hidden: false, sortable: true, dataIndex: 'processName' },
                                        ], stripeRows: true,
                                        viewConfig: {
                                            getRowClass: function (record, rowIndex, rowParams, store) {
                                                return ((rowIndex % 2) == 0) ? "even-class" : "odd-class";
                                            }
                                        },
                                        listeners: {
                                            'render': function () {
                                                loadUnAuthorizedFedexData(1, 3, Ext.getCmp('grdIASAuthorized'));
                                            },
                                            'afterrender': function () {
                                                setInterval(function () {
                                                    loadUnAuthorizedFedexData(1, 3, Ext.getCmp('grdIASAuthorized'));
                                                }, 30000);
                                            },
                                            'rowdblclick': function (e, t) {
                                                Ext.getCmp('grdIASAuthorizedDta').getEl().mask("Fetching data..Please wait...", "x-mask-loading");
                                                var rek = e.getStore().getAt(t);
                                                //alert(rek.get('processName'));

                                                $.getJSON('/Home/getDHLUsingFileName', { Fn: rek.get('processName') }, function (r) {
                                                    if (r.status.toString() == "true") {
                                                        var ar = [];
                                                        $.each(r.msg, function (i, d) {
                                                            ar[i] = [d.Id, d.objCompany.branchCode, d.AirWayBillNo, d.Shipper, d.Receipient, d.WeightInKilograms, d.AirwayBillDateString, d.Charge, d.Discount, d.SubTotal,
                                                                        d.VAT, d.NationalHealthLevy, d.NetAmount, d.Insurance, d.GrandTotal,'Authorized'];
                                                        });

                                                        Ext.getCmp('grdIASAuthorizedDta').getEl().unmask();
                                                        Ext.getCmp('grdIASAuthorizedDta').getStore().loadData(ar);
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
                        title: 'IAS Federal Express Billing Data', columnWidth: .8, defaults: { xtype: 'form', frame: true, border: true, height: 700 }, layout: 'form',
                        items: [
                            {
                                id: 'IASAuthorizeFrm',
                                items: [
                                    new Ext.grid.GridPanel({
                                        id: 'grdIASAuthorizedDta', title: '', height: 650, autoScroll: true, autoExpandColumn: 'branchCode',
                                        plugins: [IAS_authorized_editor],
                                        store: new Ext.data.GroupingStore({
                                            reader: new Ext.data.ArrayReader({}, [
                                                { name: 'Id', type: 'int' },
                                                { name: 'branchCode', type: 'string' },
                                                { name: 'AirWayBillNo', type: 'string' },
                                                { name: 'Shipper', type: 'string' },
                                                { name: 'Receipient', type: 'string' },
                                                { name: 'WeightInKilograms', type: 'string' },
                                                { name: 'AirwayBillDate', type: 'date', format: 'd/M/Y' },
                                                { name: 'Charge', type: 'string' },
                                                { name: 'Discount', type: 'string' },
                                                { name: 'SubTotal', type: 'string' },
                                                { name: 'VAT', type: 'string' },
                                                { name: 'NationalHealthLevy', type: 'string' },
                                                { name: 'NetAmount', type: 'string' },
                                                { name: 'Insurance', type: 'string' },
                                                { name: 'GrandTotal', type: 'string' },
                                                { name: 'IASAuth', type: 'string' }
                                            ]),
                                            sortInfo: {
                                                field: "Id",
                                                direction: "ASC"
                                            },
                                            groupField: "Id"
                                        }),
                                        columns: [
                                             { id: 'Id', header: 'ID', width: 25, hidden: true, sortable: true, dataIndex: 'Id' },
                                             { id: 'branchCode', header: 'BRANCH', width: 150, hidden: false, sortable: true, dataIndex: 'branchCode' },
                                             { id: 'AirWayBillNo', header: 'BILL', width: 150, hidden: false, sortable: true, dataIndex: 'AirWayBillNo' },
                                             { id: 'Shipper', header: 'SHIPPER', width: 150, hidden: false, sortable: true, dataIndex: 'Shipper' },
                                             { id: 'Receipient', header: 'RECEIPIENT', width: 70, hidden: false, sortable: true, dataIndex: 'Receipient' },
                                             { id: 'WeightInKilograms', header: 'WEIGHT(Kg)', width: 70, hidden: false, sortable: true, dataIndex: 'WeightInKilograms' },
                                             { id: 'AirwayBillDate', header: 'BILL DATE', width: 90, hidden: false, sortable: true, dataIndex: 'AirwayBillDate', xtype: 'datecolumn', format: 'd/M/Y' },
                                             { id: 'Charge', header: 'CHARGE', width: 100, hidden: false, sortable: true, dataIndex: 'Charge' },
                                             { id: 'Discount', header: 'DISBOUNT', width: 70, hidden: false, sortable: true, dataIndex: 'Discount' },
                                             { id: 'SubTotal', header: 'SUB-TOTAL', width: 70, hidden: false, sortable: true, dataIndex: 'SubTotal' },
                                             { id: 'VAT', header: 'VAT', width: 70, hidden: false, sortable: true, dataIndex: 'VAT' },
                                             { id: 'NationalHealthLevy', header: 'NHIS', width: 70, hidden: false, sortable: true, dataIndex: 'NationalHealthLevy' },
                                             { id: 'NetAmount', header: 'NET-AMOUNT', width: 70, hidden: false, sortable: true, dataIndex: 'NetAmount' },
                                             { id: 'Insurance', header: 'INSURANCE', width: 70, hidden: false, sortable: true, dataIndex: 'Insurance' },
                                             { id: 'GrandTotal', header: 'TOTAL', width: 70, hidden: false, sortable: true, dataIndex: 'GrandTotal' },
                                             {
                                                 id: 'IASAuth', header: 'STATUS', width: 100, hidden: false, sortable: true, dataIndex: 'IASAuth',
                                                 editor: {
                                                     xtype: 'combo', forceSelection: true, typeAhead: true, allowBlank: false, mode: 'local',store: ['Authorized']
                                                 }
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
                                        text: 'Authorize IAS Bill',
                                        handler: function (btn) {
                                            if (Ext.getCmp('IASAuthorizeFrm').getForm().isValid()) {
                                                var de = Ext.getCmp('grdIASAuthorizedDta').getStore().getRange();
                                                var da = [];
                                                $.each(de, function (i, d) {
                                                    da[i] = [d.data.Id, d.data.IASAuth];
                                                });
                                                
                                                $.ajax({
                                                    dataType: 'json',
                                                    url: '/Upload/AuthorizeIASFedexData',
                                                    contentType: 'application/json;charset=utf-8',
                                                    traditional: true,
                                                    data: {
                                                        items: da
                                                    },
                                                    success: function (data, status, xhttp) {
                                                        alert('response');
                                                        if (data.status.toString() == "true") {
                                                            Ext.Msg.alert('AUTHORIZE IAS FEDEX DATA', data.msg.toString(), this);
                                                            Ext.getCmp('grdIASAuthorizedDta').getStore().removeAll();
                                                        }
                                                        if (data.status.toString() == "false") {
                                                            Ext.Msg.alert('AUTHORIZE IAS FEDEX DATA', data.msg.toString(), this);
                                                        }
                                                    },
                                                    error: function (data, status, xhttp) {
                                                        Ext.Msg.alert('AUTHORIZE IAS FEDEX DATA ERROR', data.msg.toString(), this);
                                                    }
                                                });
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
                title: 'DHL AUTHORIZATION', defaults: { xtype: 'panel' }, layout: 'column',
                items: [
                    {
                        columnWidth: .2, defaults: { xtype: 'form', frame: true, border: true, height: 350 },
                        items: [
                            {
                                id: '', title: 'Branch Approved',
                                items: [
                                    new Ext.grid.GridPanel({
                                        id: 'grdDHLApproved', title: '', height: 500, autoScroll: true, autoExpandColumn: 'processName',
                                        store: new Ext.data.GroupingStore({
                                            reader: new Ext.data.ArrayReader({}, [
                                                { name: 'Id', type: 'int' },
                                                { name: 'processName', type: 'string' }
                                            ]),
                                            sortInfo: {
                                                field: "processName",
                                                direction: "ASC"
                                            },
                                            groupField: "processName"
                                        }),
                                        columns: [
                                             { id: 'Id', header: 'ID', width: 25, hidden: true, sortable: true, dataIndex: 'Id' },
                                             { id: 'processName', header: 'FILE', width: 250, hidden: false, sortable: true, dataIndex: 'processName' },
                                        ], stripeRows: true,
                                        viewConfig: {
                                            getRowClass: function (record, rowIndex, rowParams, store) {
                                                return ((rowIndex % 2) == 0) ? "even-class" : "odd-class";
                                            }
                                        },
                                        listeners: {
                                            'render': function () {
                                                getProcessNames(Ext.getCmp('grdDHLApproved'), 'DHL', 2);
                                            },
                                            'afterrender': function () {
                                                setInterval(function () {
                                                    getProcessNames(Ext.getCmp('grdDHLApproved'), 'DHL', 2);
                                                }, 120000);
                                            },
                                            'rowdblclick': function (e, t) {
                                                //load mask
                                                Ext.getCmp('grdDHLAuthorizedDta').getEl().mask("Fetching data..Please wait...", "x-mask-loading");

                                                var rec = e.getStore().getAt(t);
                                                DHL_REKORD = rec.get('processName');
                                                $.getJSON('/Home/getDHLDataUsingFileName', { Fn: rec.get('processName') }, function (r) {
                                                    if (r.status.toString() == "true") {
                                                        var ar = [];
                                                        $.each(r.msg, function (i, d) {
                                                            ar[i] = [d.Id, d.objCompany.branchCode, d.AirWayBillNo, d.Shipper, d.Receipient, d.WeightInKilograms, d.AirwayBillDateString, d.Charge, d.Discount, d.SubTotal,
                                                                        d.VAT, d.NationalHealthLevy, d.NetAmount, d.Insurance, d.GrandTotal, 'Approved'];
                                                        });
                                                        Ext.getCmp('grdDHLAuthorizedDta').getEl().unmask();
                                                        Ext.getCmp('grdDHLAuthorizedDta').getStore().loadData(ar);
                                                    }
                                                });

                                            }
                                        }
                                    })
                                ]
                            },
                            {
                                id: '', title: 'H/O Authorized',
                                items: [
                                    new Ext.grid.GridPanel({
                                        id: 'grdDHLAuthorized', title: '', height: 500, autoScroll: true, autoExpandColumn: 'processName',
                                        store: new Ext.data.GroupingStore({
                                            reader: new Ext.data.ArrayReader({}, [
                                                { name: 'Id', type: 'int' },
                                                { name: 'processName', type: 'string' }
                                            ]),
                                            sortInfo: {
                                                field: "processName",
                                                direction: "ASC"
                                            },
                                            groupField: "processName"
                                        }),
                                        columns: [
                                             { id: 'Id', header: 'ID', width: 25, hidden: true, sortable: true, dataIndex: 'Id' },
                                             { id: 'processName', header: 'FILE', width: 250, hidden: false, sortable: true, dataIndex: 'processName' },
                                        ], stripeRows: true,
                                        viewConfig: {
                                            getRowClass: function (record, rowIndex, rowParams, store) {
                                                return ((rowIndex % 2) == 0) ? "even-class" : "odd-class";
                                            }
                                        },
                                        listeners: {
                                            'render': function () {
                                                getProcessNames(Ext.getCmp('grdDHLAuthorized'), 'DHL', 3);
                                            },
                                            'afterrender': function () {
                                                setInterval(function () {
                                                    getProcessNames(Ext.getCmp('grdDHLAuthorized'), 'DHL', 3);
                                                }, 120000);
                                            },
                                            'rowdblclick': function (e, t) {
                                                Ext.getCmp('grdDHLAuthorizedDta').getEl().mask("Fetching data..Please wait...", "x-mask-loading");

                                                var rec = e.getStore().getAt(t);
                                                DHL_REKORD = rec.get('processName');

                                                $.getJSON('/Home/getDHLDataUsingFileName', { Fn: rec.get('processName') }, function (r) {
                                                    if (r.status.toString() == "true") {
                                                        var ar = [];
                                                        $.each(r.msg, function (i, d) {
                                                            ar[i] = [d.Id, d.objCompany.branchCode, d.AirWayBillNo, d.Shipper, d.Receipient, d.WeightInKilograms, d.AirwayBillDateString, d.Charge, d.Discount, d.SubTotal,
                                                                        d.VAT, d.NationalHealthLevy, d.NetAmount, d.Insurance, d.GrandTotal, 'Approved'];
                                                        });
                                                        Ext.getCmp('grdDHLAuthorizedDta').getEl().unmask();
                                                        Ext.getCmp('grdDHLAuthorizedDta').getStore().loadData(ar);
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
                        title: 'DHL Authorized', columnWidth: .8, defaults: { xtype: 'form', frame: true, border: true, height: 720 },layout:'form',
                        items: [
                            {
                                id: 'DHLAuthorizedFrm',
                                items: [
                                    new Ext.grid.GridPanel({
                                        id: 'grdDHLAuthorizedDta', title: '', height: 650, autoScroll: true, autoExpandColumn: 'branchCode',
                                        plugins: [IAS_authorized_editor],
                                        store: new Ext.data.GroupingStore({
                                            reader: new Ext.data.ArrayReader({}, [
                                                { name: 'Id', type: 'int' },
                                                { name: 'branchCode', type: 'string' },
                                                { name: 'AirWayBillNo', type: 'string' },
                                                { name: 'Shipper', type: 'string' },
                                                { name: 'Receipient', type: 'string' },
                                                { name: 'WeightInKilograms', type: 'string' },
                                                { name: 'AirwayBillDate', type: 'date', format: 'd/M/Y' },
                                                { name: 'Charge', type: 'string' },
                                                { name: 'Discount', type: 'string' },
                                                { name: 'SubTotal', type: 'string' },
                                                { name: 'VAT', type: 'string' },
                                                { name: 'NationalHealthLevy', type: 'string' },
                                                { name: 'NetAmount', type: 'string' },
                                                { name: 'Insurance', type: 'string' },
                                                { name: 'GrandTotal', type: 'string' },
                                                { name: 'IASAuth', type: 'string' }
                                            ]),
                                            sortInfo: {
                                                field: "Id",
                                                direction: "ASC"
                                            },
                                            groupField: "Id"
                                        }),
                                        columns: [
                                             { id: 'Id', header: 'ID', width: 25, hidden: true, sortable: true, dataIndex: 'Id' },
                                             { id: 'branchCode', header: 'BRANCH', width: 150, hidden: false, sortable: true, dataIndex: 'branchCode' },
                                             { id: 'AirWayBillNo', header: 'BILL', width: 150, hidden: false, sortable: true, dataIndex: 'AirWayBillNo' },
                                             { id: 'Shipper', header: 'SHIPPER', width: 150, hidden: false, sortable: true, dataIndex: 'Shipper' },
                                             { id: 'Receipient', header: 'RECEIPIENT', width: 70, hidden: false, sortable: true, dataIndex: 'Receipient' },
                                             { id: 'WeightInKilograms', header: 'WEIGHT(Kg)', width: 70, hidden: false, sortable: true, dataIndex: 'WeightInKilograms' },
                                             { id: 'AirwayBillDate', header: 'BILL DATE', width: 90, hidden: false, sortable: true, dataIndex: 'AirwayBillDate', xtype: 'datecolumn', format: 'd/M/Y' },
                                             { id: 'Charge', header: 'CHARGE', width: 100, hidden: false, sortable: true, dataIndex: 'Charge' },
                                             { id: 'Discount', header: 'DISBOUNT', width: 70, hidden: false, sortable: true, dataIndex: 'Discount' },
                                             { id: 'SubTotal', header: 'SUB-TOTAL', width: 70, hidden: false, sortable: true, dataIndex: 'SubTotal' },
                                             { id: 'VAT', header: 'VAT', width: 70, hidden: false, sortable: true, dataIndex: 'VAT' },
                                             { id: 'NationalHealthLevy', header: 'NHIS', width: 70, hidden: false, sortable: true, dataIndex: 'NationalHealthLevy' },
                                             { id: 'NetAmount', header: 'NET-AMOUNT', width: 70, hidden: false, sortable: true, dataIndex: 'NetAmount' },
                                             { id: 'Insurance', header: 'INSURANCE', width: 70, hidden: false, sortable: true, dataIndex: 'Insurance' },
                                             { id: 'GrandTotal', header: 'TOTAL', width: 70, hidden: false, sortable: true, dataIndex: 'GrandTotal' },
                                             {
                                                 id: 'IASAuth', header: 'STATUS', width: 100, hidden: false, sortable: true, dataIndex: 'IASAuth',
                                                 editor: {
                                                     xtype: 'combo', forceSelection: true, typeAhead: true, allowBlank: false, mode: 'local', store: ['Authorized']
                                                 }
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
                                        id: '', text: 'Authorize DHL Bill',
                                        listeners: {
                                            'click': function(btn){
                                                if (Ext.getCmp('DHLAuthorizedFrm').getForm().isValid())
                                                {
                                                    $.post('/Upload/AuthorizeDHLData', {Fn: DHL_REKORD}, function (rs) {
                                                        if (rs.status.toString() == "true") {
                                                            Ext.Msg.alert('DHL AUTHORIZATION', rs.msg.toString(), this);
                                                            Ext.getCmp('grdDHLAuthorizedDta').getStore().removeAll();
                                                            getProcessNames(Ext.getCmp('grdDHLAuthorized'), 'DHL', 3);
                                                            DHL_REKORD = '';
                                                        }
                                                    }, "json");

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
    });

    

    new Ext.Viewport({
        layout: 'border',
        items: [            
            {
                region: 'north', html: '<h5><strong>COURIER VERIFICATION AND PICKUP SYSTEM. PLEASE CLICK <a id=x href=/User/LogOut>HERE</a> TO LOG OUT</strong></h5><button>Log Out</button>', height: 20, border: false, margins: '0 0 5 0'
            },          
        {
            region: 'west',
            collapsible: true,
            title: 'Navigation',
            width: 230,
            height:1000,
            items: [
                {
                    xtype: 'treepanel', id: '', width: 'auto', height: 'auto', autoScroll: true, border: true,
                    root:
                    {
                        text: 'Configuration', expanded: true,
                        children: [
                            
                            {
                                text: 'DashBoard', leaf: true,
                                listeners: {
                                    'click': function (btn) {
                                        Ext.getCmp('ProcForm').layout.setActiveItem(0);
                                    }
                                }
                            },                           
                            {
                                text: 'Routes Upload', leaf: true,
                                listeners: {
                                    "click": function (btn) {
                                        Ext.getCmp('ProcForm').layout.setActiveItem(2);
                                        getProcessNumber("ROUTES", Ext.getCmp('route-n'));
                                        $('#route-n').attr('readonly', true);
                                    }
                                }
                            },
                            {
                                text: 'Monthly Pre-Verification Uploads', leaf: false,expanded: true,
                                children: [
                                    {
                                        text: 'CASH COLLECTIONS', leaf: true,
                                        html: '',
                                        listeners: {
                                            "click": function (btn) {
                                                Ext.getCmp('ProcForm').layout.setActiveItem(1);
                                                getProcessNumber('PICKUPS', Ext.getCmp('f_id'));
                                                $('#f_id').attr('readonly', true);
                                            }
                                        }
                                    },
                                    {
                                        text: 'Specie Movement', leaf: true,
                                        listeners: {
                                            "click": function (btn) {
                                                Ext.getCmp('ProcForm').layout.setActiveItem(3);
                                                getProcessNumber('SPECIEMOV', Ext.getCmp('specieName'));
                                                $('#specieName').attr('readonly', true);
                                            }
                                        }
                                    },
                                    {
                                        text: 'Teller Bills', leaf: true,
                                        listeners: {
                                            "click": function (btn) {
                                                Ext.getCmp('ProcForm').layout.setActiveItem(4);
                                                getProcessNumber('TELLR', Ext.getCmp('tellerName'));
                                                $('#tellerName').attr('readonly', true);
                                            }
                                        }
                                    },                       
                                    {
                                        text: 'IAS Fedex Data', leaf: true, 
                                        listeners: {
                                            'click': function (btn) {
                                                Ext.getCmp('ProcForm').layout.setActiveItem(11);
                                                getProcessNumber('IAS', Ext.getCmp('IASName'));
                                                $('#IASName').attr('readonly', true);
                                            }
                                        }
                                    },
                                    {
                                        text: 'DHL Data', leaf: true,
                                        listeners: {
                                            'click': function (btn) {
                                                Ext.getCmp('ProcForm').layout.setActiveItem(10);
                                                getProcessNumber('DHL', Ext.getCmp('DHLName'));
                                                $('#DHLName').attr('readonly', true);
                                            }
                                        }
                                    },
                                ]
                            },
                            {
                                text: 'Monthly Post-Verification Analysis', leaf: false, expanded: true,
                                children: [
                                    {
                                        text: 'Cash Collections', leaf: true,
                                        listeners: {
                                            'click': function (btn) {
                                                Ext.getCmp('ProcForm').layout.setActiveItem(5);
                                            }
                                        }
                                    },
                                    {
                                        text: 'Specie', leaf: true,
                                        listeners: {
                                            'click': function (btn) {
                                                Ext.getCmp('ProcForm').layout.setActiveItem(6);
                                            }
                                        }
                                    },
                                    {
                                        text: 'Teller Billing', leaf: true,
                                        listeners: {
                                            'click': function (btn) {
                                                Ext.getCmp('ProcForm').layout.setActiveItem(7);
                                            }
                                        }
                                    },
                                    {
                                        text: 'IAS Federal Express', leaf: true,
                                        listeners: {
                                            'click': function (btn) {
                                                Ext.getCmp('ProcForm').layout.setActiveItem(12);
                                            }
                                        }
                                    },
                                    {
                                        text: 'DHL', leaf: true,
                                        listeners: {
                                            'click': function (btn) {
                                                Ext.getCmp('ProcForm').layout.setActiveItem(13);
                                            }
                                        }
                                    }
                                ]
                            },
                            {
                                text: 'Staff Configuration', leaf: true, expanded: true,
                                listeners: {
                                    'click': function (btn) {
                                        Ext.getCmp('ProcForm').layout.setActiveItem(8);
                                    }
                                }
                            },
                            {
                                text: 'Exchange Rate', leaf: true, expanded: true,
                                listeners: {
                                    'click': function (btn) {
                                        Ext.getCmp('ProcForm').layout.setActiveItem(9);
                                    }
                                }
                            }
                        ]
                    }
                }
            ]
        }, {
            region: 'center',
            items: [ProcForm]
        }]
    });
});