Ext.onReady(function () {

    var ProcForm = new Ext.Panel({
        id: 'ProcForm', height: 500, width: 'auto', frame: true, border: true, layout: 'card', autoScroll: true, activeItem: 0,
        defaults: { xtype: 'form' },
        items: [
            {
                id:'testform',title: 'form one two three',
                items: [

                ],
                listeners: {
                    'afterrender': function () {
                        $('#testform').load('/Home/Index');
                    }
                }
            }
        ]
    });

    //Ext.get("appn").on("click", function () {
        var appnForm = Ext.getCmp("appForm");
        if (!appnForm) {
            appnForm = new Ext.Window({
                id: '', title: 'Application Form', height: 600, width: 1100, frame: true, resizable: true,layout:'border',
                items: [
                    {
                        region: 'north', html: '<h3><strong>The buttons for the applications goes here</strong></h3>', height: 50, border: false, margins: '0 0 5 0'
                    },
                    {
                        region: 'west', collapsible: true, title: 'Processes', width: 200, height: 550, frame: true,
                        items: [
                            {
                                xtype: 'treepanel', id: '', width: 'auto', height: 'auto', autoScroll: true, border: true,
                                root: {
                                    text: 'Application', expanded: true,
                                    children: [
                                        {
                                            text: 'Basic Info', leaf: true,
                                            listeners: {
                                                "click": function (btn) {
                                                    Ext.getCmp('ProcForm').layout.setActiveItem(0);
                                                }
                                            }
                                        },
                                        {
                                            text: 'Employment Data', leaf: true,
                                            listeners: {
                                                "click": function (btn) {
                                                    Ext.getCmp('ProcForm').layout.setActiveItem(1);
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
                           // new maps.AbstractFormPanel({
                            //    title: 'testing one two three'
                        //})
                            ProcForm
                        ]
                    }
                ]
            });
        }

        appnForm.show();
    //});
});