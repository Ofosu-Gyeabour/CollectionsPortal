Ext.onReady(function(){

    Ext.get('appn').on('click',function(e,t){
    
        var win = Ext.getCmp('payWin');
        if (!win)
        {
            new Ext.Window({
                id: 'vwSalary', title: 'Staff Salary Portal', height: 615, width: 1050, defaults: { xtype: 'panel', frame: true },
                resizable: false,layout: 'border',
                items: [
                    {
                        region: 'west', title: 'Searches', width: '20%', height: '100%', collapsible: true,
                        defaults: { xtype: 'form', frame: true },
                        listeners: {
                            'afterrender': function () {
                                $.getJSON('/Helper/getYears', {}, function (msg) {
                                    
                                });
                            }
                        },
                        items: [
                            {
                                id: '', title: 'Year', defaults: { xtype: 'combo', anchor: '90%' }, height: '30%',labelAlign: 'top', collapsible: true,
                                items: [
                                    {
                                        id: 'cboYr', fieldLabel: 'Select Year', emptyText: 'select year', forceSelection: true,
                                        mode: 'local', allowBlank: false,
                                        store: new Ext.data.Store({
                                            autoLoad: true, restful: true, url: '/Helper/getYears',
                                            reader: new Ext.data.JsonReader({}, [
                                                { name: 'Id', type: 'int' },
                                                { name: 'yr', type: 'string' }
                                            ]),
                                        }), valueField: 'Id', displayField: 'yr'
                                    }
                                    
                                ]
                            },
                            {
                                id: '', title: 'Range', defaults: { xtype: 'combo', anchor: '90%' }, height: '30%', labelAlign: 'top', collapsible: true,
                                items: [
                                    {
                                        id: '', fieldLabel: 'From',  forceSelection: true, autoComplete: true,mode: 'local',
                                        store: new Ext.data.Store({
                                            autoLoad: true, restful: true, url: '/Helper/getYears',
                                            reader: new Ext.data.JsonReader({}, [
                                                { name: 'Id', type: 'int' },
                                                { name: 'yr', type: 'string' }
                                            ]),
                                        }), valueField: 'Id', displayField: 'yr'
                                    },
                                    {
                                        id: '', fieldLabel: 'To',  forceSelection: true, autoComplete: true,mode: 'local',
                                        store: new Ext.data.Store({
                                            autoLoad: true, restful: true, url: '/Helper/getYears',
                                            reader: new Ext.data.JsonReader({}, [
                                                { name: 'Id', type: 'int' },
                                                { name: 'yr', type: 'string' }
                                            ]),
                                        }), valueField: 'Id', displayField: 'yr'
                                    }
                                ],
                                buttons: [
                                    {
                                        text: 'Search',
                                        handler: function (btn) {
                                            Ext.Msg.alert("searching...", "No data exist in the database", this);
                                        }
                                    }
                                ]
                            },
                            {
                                id: '', title: 'Statistics', defaults: { type: 'xtemplate' },
                                items: [
                                    {
                                        tpl: new Ext.XTemplate(
                                            '<div style="max-width:1000px;max-height:100%;">',
                                                '<b style="font-size:12px;">Accumulated PF:</b>&nbsp&nbsp<strong><b style="color:green;font-size:12px;">GHS&nbsp{PF}</b></strong>',
                                            '</div><br>',

                                            '<div style="max-width:340px;max-height:100%;">',
                                                '<b style="font-size:12px;">Accum. Salary:</b>&nbsp&nbsp<strong><b style="color:green;font-size:12px;">GHS&nbsp{salary}</b></strong>',
                                            '</div><br>',

                                            '<div style="max-width:340px;max-height:100%;">',
                                                '<b style="font-size:12px;">Total Allowances:</b>&nbsp&nbsp<strong><b style="color:green;font-size:12px;">GHS&nbsp{allowances}</b></strong>',
                                            '</div><br>',

                                            '<div style="max-width:340px;max-height:100%;">',
                                                '<b style="font-size:12px;">Total Loans:</b>&nbsp&nbsp<strong><b style="color:green;font-size:12px;">GHS&nbsp{totLoans}</b></strong>',
                                            '</div><br>'
                                        ),
                                        id: 'lscheduleDta', compiled: true, data: { PF: '0.00', salary: '0.00', allowances: '0.00', totLoans: '0.00' }
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        region: 'center', width: '60%', title: 'Salary Data', collapsible: false,
                        defaults: { xtype: 'panel', frame: true, collapsible: true },layout: 'accordion',
                        items: [
                            {
                                defaults: { xtype: 'form', frame: true }, width: '100%', height: '100%',layout: 'form',
                                items: [
                                    {
                                        id: '',
                                        items: [
                                           new Ext.grid.GridPanel({
                                               id: '', width: '100%', height: '100%',//autoLoad: true, restful: true, url: '',
                                               store: new Ext.data.Store({
                                                   reader: new Ext.data.JsonReader({}, [
                                                       { name: 'testone', type: 'string' },
                                                       { name: 'testtwo', type: 'string' }
                                                   ])
                                               }),
                                               columns: [
                                                    { header: 'testing one', id: 'testone', hidden: true,width:40, sortable: true, dataIndex: 'testone'},
                                                    { header: '', id: 'testtwo', hidden: false, width: 80, sortable: true, dataIndex: 'testtwo' }
                                               ], stripeRows: true, autoExpandColumn: 'testtwo',
                                               viewConfig: {
                                                   forceFit: true
                                               }
                                               
                                           })
                                        ]
                                    }
                                ]
                            },
                            //{ title: 'graph details' }
                        ]
                    }
                ]
            }).show();
        }
    });
});
