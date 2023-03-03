Ext.onReady(function () {
    var pickup_editor = new Ext.ux.grid.RowEditor();
    var specie_editor = new Ext.ux.grid.RowEditor();
    var IAS_editor = new Ext.ux.grid.RowEditor();
    var DHL_editor = new Ext.ux.grid.RowEditor();

    var QFinder = function (k,FIL,TYP,P1,P2) {
        //k = grid control
        //FIL = PICKUPS, SPECIE
        //TYP = type of query...FILE or DATE RANGE
        //P1 and P2 are parameters one and two
        var dd = [];
        switch (FIL) {
            case 'PICKUPS':
                if (TYP == '') {
                    //use P1 and P2 to fetch data
                    $.getJSON('/Home/getPickupUsingDate',{df:P1,dt:P2},function(r){
                        if (r.status.toString() == "true"){
                            $.each(r.msg,function(i,d){
                                dd[i] = [d.Id, d.objPickup.Date, d.objCompany.branchCode, d.objPickup.vehicleRegistration, d.objPickup.NameOfDriver, d.objRoute.tripFrom, d.objRoute.tripTo, d.objPickup.tripStartTime, d.objPickup.tripEndTime, d.objPickup.amountDelivered, d.objPickup.amountRepatriated, d.objPickup.NIBOfficer, d.objPickup.totalMilage, d.objPickup.KmEquivalent.toString(), d.objPickup.KmEquivalent.toString()];
                            });
                            k.getStore().loadData(dd);
                        }
                    });
                }
                else
                {
                    $.getJSON('/Home/getPickupsUsingFileName', {FNAME:TYP}, function (r) {
                        if (r.status.toString() == "true") {
                            $.each(r.msg, function (i, d) {
                                dd[i] = [d.Id, d.objCompany.branchCode, d.objCashCollection.customerName, d.objCashCollection.customerLocation, d.objCashCollection.pickFrequency.toString(),
                                    d.objCashCollection.rate.toString(), d.objCashCollection.amt.toString(), d.objCashCollection.total.toString(), d.objCashCollection.isWeekDayExpr.toString(),
                                    'Approved'];// d.objCashCollection.total.toString()];
                            });

                            k.getStore().loadData(dd);
                        }
                    });
                }
                
                return;
                case 'SPECIEMOV':
                if (TYP == '') {

                }
                else
                {
                    $.getJSON('/Home/getSpecieMovementUsingFileName', {FNAME: TYP}, function (r) {
                        if (r.status.toString() == "true") {
                            $.each(r.msg, function (i, d) {
                                dd[i] = [d.Id, d.objCompany.branchCode, d.objRoute.tripFrom, d.objRoute.tripTo, d.objSpecie.Milage, d.objSpecie.FrequencyOfTrip,
                                    d.objSpecie.RevenueFromRate, 'Approved'];
                            });
                            k.getStore().loadData(dd);
                        }
                    });
                }
        }
    }
    
    var ProcForm = new Ext.Panel({
        id: 'ProcForm', height: 1000, width: 'auto', frame: true, border: true, layout: 'card', autoScroll: true, activeItem: 0,
        defaults: { xtype: 'panel' },
        items: [
            {
                id: 'testform', defaults: { xtype: 'panel', frame: true, border: true }, layout: 'column',
                items: [
                    {
                        defaults: { xtype: 'form', frame: true, border: true, collapsible: true }, layout: 'form',columnWidth:.3,
                        items: [
                            {
                                id: 'dtfQ', title: 'Pickup Query Finder',
                                defaults: { xtype: 'combo', forceSelection: true, typeAhead: true, mode: 'local', anchor: '95%', allowBlank: false },layout:'form',
                                items: [
                                    {
                                        id: 'dtfn',fieldLabel: 'File',
                                        store: new Ext.data.Store({
                                            autoLoad: true, restful: false,
                                            url: '/Home/getProcessList?PTYP=PICKUPS',
                                            reader: new Ext.data.JsonReader({root:'msg'}, [
                                                { name: 'Id', type: 'int' },
                                                { name: 'processName', type: 'string' }
                                            ])
                                        }), valueField: 'Id',displayField: 'processName'
                                    }
                                ],
                                buttons: [
                                    {
                                        id: 'fnclear', text: 'Clear',
                                        listeners: {
                                            'click': function () {
                                                Ext.getCmp('dtfQ').getForm().reset();
                                                Ext.getCmp('dtfrm').getForm().reset();
                                                Ext.getCmp('grdPickupVerification').getStore().removeAll();
                                            }
                                        }
                                    },
                                    {
                                        id: 'fnfetch', text: 'Fetch',
                                        listeners: {
                                            'click': function (btn) {
                                                var fQfrm = Ext.getCmp('dtfQ').getForm();
                                                if (fQfrm.isValid()) {
                                                    QFinder(Ext.getCmp('grdPickupVerification'), 'PICKUPS', Ext.fly('dtfn').getValue(), '', '');
                                                }
                                            }
                                        }
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        defaults: { xtype: 'form', frame: true, border: true }, layout: 'form',title: 'Query Results', columnWidth:.7,
                        items: [
                            new Ext.grid.GridPanel({
                                id: 'grdPickupVerification', title: '', height: 500, autoScroll: true, autoExpandColumn: 'branch',
                                plugins: [pickup_editor],
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
                                        { name: 'btotal', type: 'string' }
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
                                     { id: 'CustomerName', header: 'CUSTOMER', width: 170, hidden: false, sortable: true, dataIndex: 'CustomerName' },
                                     { id: 'CustomerLocation', header: 'LOCATION', width: 150, hidden: false, sortable: true, dataIndex: 'CustomerLocation' },
                                     { id: 'pickFrequency', header: 'FREQ', width: 90, hidden: false, sortable: true, dataIndex: 'pickFrequency' },
                                     { id: 'rate', header: 'RATE', width: 90, hidden: false, sortable: true, dataIndex: 'rate' },
                                     { id: 'amt', header: 'AMOUNT', width: 100, hidden: false, sortable: true, dataIndex: 'amt' },
                                     {
                                         id: 'total', header: 'GRANDTOTAL', width: 100, hidden: false, sortable: true, dataIndex: 'total'
                                     },
                                     { id: 'isWeekDayExpr', header: 'WEEKDAY', width: 70, hidden: false, sortable: true, dataIndex: 'isWeekDayExpr' },
                                     {
                                         id: 'btotal', header: 'BRANCH.INPUT', width: 120, hidden: false, sortable: true, dataIndex: 'btotal',
                                         editor: {
                                             xtype: 'combo', allowBlank: false, forceSelection: true, typeAhead: true, mode: 'local', store: ['Approved','Disapproved']
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
                                    'click': function () {
                                        var ee = Ext.getCmp('grdPickupVerification').getStore().getRange();
                                        var dta = [];

                                        $.each(ee, function (i, d) {
                                            dta[i] = [d.data.Id, d.data.btotal];
                                        });

                                        $.ajax({
                                            dataType: 'json',
                                            url: '/Upload/AuthorizeBranchPickup',
                                            contentType: 'application/json;charset=utf-8',
                                            traditional: true,
                                            data: {
                                                items: dta
                                            },
                                            success: function (data, status, xhttp) {
                                                if (data.status.toString() == "true") {
                                                    Ext.Msg.alert('AUTHORIZE BRANCH PICKUP', data.msg.toString(), this);
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
                        ]
                    }
                ]
            },
            {
                defaults: { xtype: 'panel' }, layout: 'column',
                items: [
                    {
                        columnWidth: .3, defaults: { xtype: 'form', frame: true, border: true, collapsible: true }, layout: 'form',
                        items: [
                            {
                                id: 'snQ', title: 'Specie Name Query', defaults: { xtype: 'combo',anchor: '90%', forceSelection: true, typeAhead: true, mode: 'local', allowBlank: false },
                                items: [
                                    {
                                        id: 'snQfname', fieldLabel: 'File Name',
                                        store: new Ext.data.Store({
                                            autoLoad: true, restful: false,
                                            url: '/Home/getProcessList?PTYP=SPECIEMOV',
                                            reader: new Ext.data.JsonReader({root:'msg'}, [
                                                { name: 'Id', type: 'int' },
                                                { name: 'processName', type: 'string' }
                                            ])
                                        }),valueField: 'Id', displayField: 'processName'
                                    }
                                ],
                                buttons: [
                                    {
                                        id: 'snQclear', text: 'Clear',
                                        handler: function (btn) {
                                            Ext.getCmp('snQ').getForm().reset();
                                            Ext.getCmp('sQ').getForm().reset();
                                            Ext.getCmp('grdSpecieDtaVerification').getStore().removeAll(); //clear the grid
                                        }
                                    },
                                    {
                                        id: 'snQfetch', text: 'Fetch',
                                        listeners: {
                                            'click': function (btn) {
                                                var snQfrm = Ext.getCmp('snQ').getForm();
                                                if (snQfrm.isValid()) {
                                                    QFinder(Ext.getCmp('grdSpecieDtaVerification'), 'SPECIEMOV', Ext.fly('snQfname').getValue(), '', '');
                                                }
                                            }
                                        }
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        title: 'Specie Data Results', columnWidth: .7, defaults: { xtype: 'form', frame: true, border: true }, layout: 'form',
                        items: [
                            {
                                id: 'frmSpecieRsults',
                                items: [
                                    new Ext.grid.GridPanel({
                                        id: 'grdSpecieDtaVerification', title: '', height: 500, autoScroll: true, autoExpandColumn: 'branch',
                                        plugins: [specie_editor],
                                        store: new Ext.data.GroupingStore({
                                            reader: new Ext.data.ArrayReader({}, [
                                                { name: 'Id', type: 'int' },
                                                { name: 'branch', type: 'string' },
                                                { name: 'tripFrom', type: 'string' },
                                                { name: 'tripTo', type: 'string' },
                                                { name: 'Milage', type: 'string' },
                                                { name: 'FrequencyOfTrip', type: 'string' },
                                                { name: 'RevenueFromRate', type: 'string' },
                                                { name: 'NIBRevInput', type: 'string' }
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
                                                 id: 'NIBRevInput', header: 'BRANCH INPUT', width: 150, hidden: false, sortable: true, dataIndex: 'NIBRevInput',
                                                 editor: {
                                                     xtype: 'combo', allowBlank: false, mode: 'local', store: ['Approved','Disapproved']
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
                                        id: '', text: 'Approve Specie Data',
                                        listeners: {
                                            'click': function (btn) {
                                                if (Ext.getCmp('frmSpecieRsults').getForm().isValid() && Ext.getCmp('grdSpecieDtaVerification').getStore().getCount() > 0) {
                                                    var ee = Ext.getCmp('grdSpecieDtaVerification').getStore().getRange();

                                                    var dt = [];
                                                    $.each(ee, function (i, d) {
                                                        dt[i] = [d.data.Id, d.data.NIBRevInput];
                                                    });

                                                    $.ajax({
                                                        dataType: 'json',
                                                        url: '/Upload/AuthorizeSpecieData',
                                                        contentType: 'application/json;charset=utf-8',
                                                        traditional: true,
                                                        data: {
                                                            items: dt
                                                        },
                                                        success: function (data, status, xhttp) {
                                                            if (data.status.toString() == "true") {
                                                                Ext.Msg.alert('APPROVE BRANCH SPECIE MOVEMENT', data.msg.toString(), this);
                                                            }
                                                            if (data.status.toString() == "false") {

                                                            }
                                                        },
                                                        error: function (data, status, xhttp) {

                                                        }
                                                    });
                                                }
                                                else { Ext.Msg.alert('VALID FIELDS', 'Please enter valid data to proceed', this); }
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
                        columnWidth: .3, defaults: { xtype: 'form' }, layout: 'fit',
                        items: [
                            {
                                id: 'tibcollfrm', title: 'Teller File Query Finder',
                                defaults: { xtype: 'combo', forceSelection: true, typeAhead: true, allowBlank: false, mode: 'local', anchor: '90%' },layout: 'form',
                                items: [
                                    {
                                        id: 'tibfn',fieldLabel: 'File name',
                                        store: new Ext.data.Store({
                                            autoLoad: true, restful: false,
                                            url: '/Home/getDistinctTellerFileNames',
                                            reader: new Ext.data.JsonReader({type: 'json', root: 'msg'}, [
                                                { name: 'tellerId', type: 'int' },
                                                { name: 'location', type: 'string' }
                                            ])
                                        }), valueField: 'tellerId', displayField: 'location'
                                    }
                                ],
                                buttons: [
                                    {
                                        id: '', text: 'Clear',
                                        listeners: {
                                            'click': function (btn) {
                                                Ext.getCmp('grdTellerVerification').getStore().removeAll();
                                                Ext.getCmp('tibcollfrm').getForm().reset();
                                                $('#tibfn').val('').focus();
                                            }
                                        }
                                    },
                                    {
                                        id: '', text: 'Fetch',
                                        listeners: {
                                            'click': function (btn) {
                                                if (Ext.getCmp('tibcollfrm').getForm().isValid()) {
                                                    $.getJSON('/Home/getTellerDetails', {CAPTION: Ext.fly('tibfn').getValue()}, function (r) {
                                                        if (r.status.toString() == "true") {
                                                            var rr = [];
                                                            $.each(r.msg, function (i, d) {
                                                                rr[i] = [d.tellerId,d.objCompany.branchCode,d.location,d.tellerNumbers,d.tellerNames,d.tRate,d.objProcess.processName, 'Approve'];
                                                            });                                                            
                                                            
                                                            Ext.getCmp('grdTellerVerification').getStore().loadData(rr);

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
                        columnWidth: .7, defaults: { xtype: 'form', frame: true, border: true }, layout: 'form',
                        items: [
                            {
                                id: 'tibfmresults', title: 'Teller Query Results',
                                items: [
                                    new Ext.grid.GridPanel({
                                        id: 'grdTellerVerification', title: '', height: 500, autoScroll: true, autoExpandColumn: 'branchCode',
                                        plugins: [specie_editor],
                                        store: new Ext.data.GroupingStore({
                                            reader: new Ext.data.ArrayReader({}, [
                                                { name: 'tellerId', type: 'int' },
                                                { name: 'branchCode', type: 'string' },
                                                { name: 'location', type: 'string' },
                                                { name: 'tellerNumbers', type: 'string' },
                                                { name: 'tellerNames', type: 'string' },
                                                { name: 'tRate', type: 'string' },
                                                { name: 'processName', type: 'string' },
                                                { name: 'aprStatus', type: 'string' }
                                            ]),
                                            sortInfo: {
                                                field: "branchCode",
                                                direction: "ASC"
                                            },
                                            groupField: "branchCode"
                                        }),
                                        columns: [
                                             { id: 'tellerId', header: 'ID', width: 25, hidden: true, sortable: true, dataIndex: 'tellerId' },
                                             { id: 'branchCode', header: 'COMPANY', width: 150, hidden: false, sortable: true, dataIndex: 'branchCode' },
                                             { id: 'location', header: 'LOCATION', width: 150, hidden: false, sortable: true, dataIndex: 'location' },
                                             { id: 'tellerNumbers', header: 'TELLR NO', width: 70, hidden: false, sortable: true, dataIndex: 'tellerNumbers' },
                                             {
                                                 id: 'tellerNames', header: 'NAMES', width: 150, hidden: false, sortable: true, dataIndex: 'tellerNames'
                                             },
                                             {
                                                 id: 'tRate', header: 'RATE', width: 70, hidden: false, sortable: true, dataIndex: 'tRate'
                                             },
                                             { id: 'processName', header: 'PROCESS', width: 70, hidden: false, sortable: true, dataIndex: 'processName' },
                                             {
                                                 id: 'aprStatus', header: 'STATUS', width: 70, hidden: false, sortable: true, dataIndex: 'aprStatus',
                                                 editor: {
                                                     xtype: 'combo', forceSelection: true, typeAhead: true,allowBlank: false, mode: 'local', store: ['Approve','Disapprove']
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
                                        id: '', text: 'Approve',
                                        listeners: {
                                            'click': function (btn) {
                                                if (Ext.getCmp('tibfmresults').getForm().isValid()) {
                                                    var edf = Ext.getCmp('grdTellerVerification').getStore().getRange();
                                                    var arrd = [];

                                                    $.each(edf, function (i, d) {
                                                        arrd[i] = [d.data.tellerId, d.data.aprStatus];
                                                    });

                                                    $.ajax({
                                                        dataType: 'json',
                                                        url: '/Upload/ApproveTellerBillCollections',
                                                        contentType: 'application/json;charset=utf-8',
                                                        traditional: true,
                                                        data: {
                                                            items: arrd
                                                        },
                                                        success: function (data, status, xhttp) {
                                                            if (data.status.toString() == "true") {
                                                                Ext.Msg.alert('APPROVE TELLER BILLING', data.msg.toString(), this);
                                                            }
                                                            if (data.status.toString() == "false") {
                                                                Ext.Msg.alert('APPROVE TELLER STATUS', data.msg.toString(), this);
                                                            }
                                                        },
                                                        error: function (data, status, xhttp) {
                                                            Ext.Msg.alert('APPROVE TELLER ERROR', data.msg.toString(), this);
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
                defaults: { xtype: 'panel' }, layout: 'column',
                items: [
                    {
                        columnWidth: .3, defaults: { xtype: 'form', frame: true, border: true }, layout: 'form',
                        items: [
                            {
                                id: '', title: 'IAS File Query Finder',
                                defaults: { xtype: 'combo', forceSelection: true, typeAhead: true, mode: 'local',allowBlank: false, anchor: '90%' },
                                items: [
                                    {
                                        id: 'cboiasprocess', fieldLabel: 'IAS File',
                                        store: new Ext.data.Store({
                                            autoLoad: true, restful: false,
                                            url: '/Home/getProcessList?PTYP=IAS',
                                            reader: new Ext.data.JsonReader({type: 'json', root: 'msg'}, [
                                                { name: 'Id', type: 'int' },
                                                { name: 'processName', type: 'string' }
                                            ])
                                        }), valueField: 'Id', displayField: 'processName',
                                        listeners: {
                                            'select': function () {
                                                /*
                                                $.getJSON('/Home/getDHLUsingFileName', { Fn: Ext.fly('cboiasprocess').getValue() }, function (r) {
                                                    if (r.status.toString() == "true") {
                                                        var ar = [];
                                                        $.each(r.msg, function (i, d) {
                                                            ar[i] = [d.Id, d.objCompany.branchCode, d.AirWayBillNo, d.Shipper, d.Receipient, d.WeightInKilograms, d.AirwayBillDateString, d.Charge, d.Discount, d.SubTotal,
                                                                        d.VAT, d.NationalHealthLevy, d.NetAmount, d.Insurance, d.GrandTotal,'Approved'];
                                                        });

                                                        Ext.getCmp('grdIASApprover').getStore().loadData(ar);
                                                    }
                                                });
                                                */
                                            }
                                        }
                                    }
                                ],
                                buttons: [
                                    {
                                        text: 'Clear',
                                        handler: function (btn) {
                                            Ext.getCmp('grdIASApprover').getStore().removeAll();
                                            $('#cboiasprocess').val('').focus();
                                        }
                                    },
                                    {
                                        text: 'Fetch IAS Data',
                                        handler: function (btn) {
                                            $.getJSON('/Home/getDHLUsingFileName', { Fn: Ext.fly('cboiasprocess').getValue() }, function (r) {
                                                if (r.status.toString() == "true") {
                                                    var ar = [];
                                                    $.each(r.msg, function (i, d) {
                                                        ar[i] = [d.Id, d.objCompany.branchCode, d.AirWayBillNo, d.Shipper, d.Receipient, d.WeightInKilograms, d.AirwayBillDateString, d.Charge, d.Discount, d.SubTotal,
                                                                    d.VAT, d.NationalHealthLevy, d.NetAmount, d.Insurance, d.GrandTotal, 'Approved'];
                                                    });

                                                    Ext.getCmp('grdIASApprover').getStore().loadData(ar);
                                                }
                                            });
                                        }
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        columnWidth: .7, defaults: { xtype: 'form', frame: true, border: true, height: 700 }, layout: 'form',
                        items: [
                            {
                                id: 'IASQueryFrm', title: 'IAS Query Results',
                                items: [
                                    new Ext.grid.GridPanel({
                                        id: 'grdIASApprover', title: '', height: 650, autoScroll: true, autoExpandColumn: 'branchCode',
                                        plugins: [IAS_editor],
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
                                                { name: 'IASApprStatus', type: 'string' }
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
                                                 id: 'IASApprStatus', header: 'STATUS', width: 70, hidden: false, sortable: true, dataIndex: 'IASApprStatus',
                                                 editor: {
                                                     xtype: 'combo',typeAhead: true, forceSelection: true,allowBlank: false, mode: 'local',store: ['Approved','Pending']
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
                                        text: 'Approve IAS Data',
                                        handler: function (btn) {
                                            if (Ext.getCmp('IASQueryFrm').getForm().isValid()) {
                                                if (Ext.getCmp('grdIASApprover').getStore().getCount() > 0) {
                                                    var iasdt = Ext.getCmp('grdIASApprover').getStore().getRange();
                                                    var arr = [];

                                                    $.each(iasdt, function (i, d) {
                                                        arr[i] = [d.data.Id, d.data.IASApprStatus];
                                                    });

                                                    $.ajax({
                                                        dataType: 'json',
                                                        url: '/Upload/ApproveIASData',
                                                        contentType: 'application/json;charset=utf-8',
                                                        traditional: true,
                                                        data: {
                                                            items: arr
                                                        },
                                                        success: function (data, status, xhttp) {
                                                            if (data.status.toString() == "true") {
                                                                Ext.Msg.alert('APPROVE IAS FEDEX DATA', data.msg.toString(), this);
                                                            }
                                                            if (data.status.toString() == "false") {
                                                                Ext.Msg.alert('APPROVE IAS FEDEX DATA', data.msg.toString(), this);
                                                            }
                                                        },
                                                        error: function (data, status, xhttp) {
                                                            Ext.Msg.alert('APPROVE IAS FEDEX DATA ERROR', data.msg.toString(), this);
                                                        }
                                                    });
                                                }
                                                else { Ext.Msg.alert('IAS APPROVAL', 'Empty Data Set', this); }
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
                defaults: { xtype: 'panel' },layout:'column',
                items: [
                    {
                        columnWidth: .3, defaults: { xtype: 'form', frame: true, border: true },
                        items: [
                            {
                                id: '', title: 'DHL Query File Finder', defaults: { xtype: 'combo', forceSelection: true, typeAhead: true, mode: 'local',allowBlank: false, anchor: '90%' },
                                items: [
                                    {
                                        id: 'cbodhlprocess',fieldLabel: 'DHL File',
                                        store: new Ext.data.Store({
                                            autoLoad: true, url: '/Home/getProcessList?PTYP=DHL', restful: true,
                                            reader: new Ext.data.JsonReader({type:'json', root: 'msg'}, [
                                                { name: 'Id', type: 'int' },
                                                { name: 'processName', type: 'string' }
                                            ])
                                        }), valueField: 'Id', displayField: 'processName'
                                    }
                                ],
                                buttons: [
                                    {
                                        text: 'Clear',
                                        handler: function (btn) {
                                            Ext.getCmp('grdDHLApprover').getStore().removeAll();
                                            $('#cbodhlprocess').val('').focus();
                                        }
                                    },
                                    {
                                        text: 'Fetch DHL Data',
                                        handler: function (btn) {
                                            $.getJSON('/Home/getDHLDataUsingFileName', { Fn: Ext.fly('cbodhlprocess').getValue() }, function (r) {
                                                if (r.status.toString() == "true") {
                                                    var ar = [];
                                                    $.each(r.msg, function (i, d) {
                                                        ar[i] = [d.Id, d.objCompany.branchCode, d.AirWayBillNo, d.Shipper, d.Receipient, d.WeightInKilograms, d.AirwayBillDateString, d.Charge, d.Discount, d.SubTotal,
                                                                    d.VAT, d.NationalHealthLevy, d.NetAmount, d.Insurance, d.GrandTotal, 'Approved'];
                                                    });

                                                    Ext.getCmp('grdDHLApprover').getStore().loadData(ar);
                                                }
                                            });
                                        }
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        columnWidth: .7, defaults: { xtype: 'form', frame: true, border: true }, layout: 'form',
                        items: [
                            {
                                id: 'DHLQueryFrm', title: 'DHL Query Results',
                                items: [
                                    new Ext.grid.GridPanel({
                                        id: 'grdDHLApprover', title: '', height: 650, autoScroll: true, autoExpandColumn: 'branchCode',
                                        plugins: [DHL_editor],
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
                                                { name: 'IASApprStatus', type: 'string' }
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
                                                 id: 'IASApprStatus', header: 'STATUS', width: 70, hidden: false, sortable: true, dataIndex: 'IASApprStatus',
                                                 editor: {
                                                     xtype: 'combo', typeAhead: true, forceSelection: true, allowBlank: false, mode: 'local', store: ['Approved']
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
                                        text: 'Approve DHL Data',
                                        handler: function (btn) {
                                            if (Ext.getCmp('DHLQueryFrm').getForm().isValid()) {
                                                if (Ext.getCmp('grdDHLApprover').getStore().getCount() > 0) {
                                                    $.post('/Upload/ApproveCorrectDHLData', { Fn: Ext.fly('cbodhlprocess').getValue() }, function (rs) {
                                                        if (rs.status.toString() == "true") {
                                                            Ext.Msg.alert('DHL APPROVAL SUCCESS', rs.msg.toString(), this);
                                                        }
                                                        else { Ext.Msg.alert('DHL APPROVAL ERROR', rs.msg.toString(), this); }
                                                    },"json");
                                                }
                                                else { Ext.Msg.alert('DHL APPROVAL', 'Empty Data Set', this); }
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

    var appnForm = Ext.getCmp("appForm");
    if (!appnForm) {
        appnForm = new Ext.Viewport({
            id: '', title: 'Application Form', height: 600, width: 1100, frame: true, resizable: true, layout: 'border',
            items: [
                {
                    region: 'north', html: '<h1><strong>COURIER VERIFICATION SYSTEM. PLEASE CLICK <a id=x href=/User/LogOut>HERE</a> TO LOG OUT</strong></h1><button>Log Out</button>', height: 20, border: true, margins: '0 0 5 0'
                },
                {
                    region: 'west', collapsible: true, title: 'Processes', width: 200, height: 550, frame: true,
                    items: [
                        {
                            xtype: 'treepanel', id: '', width: 'auto', height: 'auto', autoScroll: true, border: true,
                            root: {
                                text: 'Data Verification', expanded: true,
                                children: [
                                    {
                                        text: 'Pickups', leaf: true,
                                        listeners: {
                                            "click": function (btn) {
                                                Ext.getCmp('ProcForm').layout.setActiveItem(0);
                                            }
                                        }
                                    },
                                    {
                                        text: 'Specie Movement', leaf: true,
                                        listeners: {
                                            "click": function (btn) {
                                                Ext.getCmp('ProcForm').layout.setActiveItem(1);
                                            }
                                        }
                                    },
                                    {
                                        text: 'Teller Bills',leaf: true,
                                        listeners: {
                                            "click": function (btn) {
                                                Ext.getCmp('ProcForm').layout.setActiveItem(2);
                                            }
                                        }
                                    },
                                    {
                                        text: 'IAS Fedex', leaf: true,
                                        listeners: {
                                            "click": function (btn) {
                                                Ext.getCmp('ProcForm').layout.setActiveItem(3);
                                            }
                                        }
                                    },
                                    {
                                        text: 'DHL', leaf: true,
                                        listeners: {
                                            "click": function (btn) {
                                                Ext.getCmp('ProcForm').layout.setActiveItem(4);
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    ]
                },
                {
                    region: 'center',
                    width: 700,
                    items: [
                        ProcForm
                    ]
                }
            ]
        });
    }

    appnForm.show();
    
});