sap.ui.define([], function () {
	"use strict";
	return {
		leavecalculator: function (totalleave, takenleave) {
        var ans=totalleave-takenleave
        if(ans<0)
			return 0 ;
        return ans;
		},
        name:function(empid, Employee_data){
            var data = Employee_data;
        //    console.log(data)
            var ans=[];
            data.forEach(element => {
                if(element['empid']==empid){
                    ans.push(element['empname'],element['ContactNo'])
                }
            });

            return ans[0];
        },
	};
});