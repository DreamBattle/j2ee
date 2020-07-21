/**
 * @author zhangshizhe
 * @date 2018-10-23
 */
var g_return = "";
$(function () {
    fun_assessAllSelectUser();
});

var fun_assessAllSelectUser = function () {
    var m_select_rowId = "";
    var m_select_rowIndex = 0;
    var m_select_rowData = null;

    var m_select_tg_org_rowId = "";
    var m_select_tg_org_rowIndex = 0;
    
    var m_select_rowId_select = "";
    var m_select_rowIndex_select = 0;
    var m_select_rowData_select = null;
    
    var m_arr_rows = [];
    var m_id_org = "";

    var is_init = true ;//第一次默认加载第一行 

    init_fun_assessAllSelectUser();

    function init_fun_assessAllSelectUser() {
        if (NOTNULL(g_in_data)) {
            g_in_obj = $.parseJSON(g_in_data);
            m_arr_rows = g_in_obj.arr;
            m_id_org = g_in_obj.org;
        } else {
            showAlertWarning("输入参数获取失败，请刷新后重试...");
            return;
        }

        initControl();
        init_datagrid();
        init_treegrid();
        init_datagrid_select();

        // $('#dg_select').datagrid().datagrid('enableCellEditing');
        
        $('#btnSaveSingle').bind('click', btnSaveSingleOnClick);
        
        layer.config({
            extend: 'enter/layer.css', // 加载您的扩展样式
            skin: 'layer-ext-enter'
        });
        
//        $("#dg_select").datagrid('loadData', m_rows);
    }

    function initControl() {

        $("#dg_searchbox").searchbox({
            height: '28',
            width: 220,
            prompt: '请输入用户信息进行查找...',
            searcher: function (e) {
                search_reception();
            }
        });

        $('body').on("click", "#btn_addOne", function () {
            onClick_addOne();
        });

        $('body').on("click", "#btn_addAll", function () {
            onClick_addAll();
        });
        $('body').on("click", "#btn_minusOne", function () {
            onClick_minusOne();
        });

        $('body').on("click", "#btn_minusAll", function () {
            onClick_minusAll();
        });
    }


    function btnSaveSingleOnClick() {
        var select_objs = $("#dg_select").datagrid("getRows");
        if (select_objs == null || select_objs.length < 1) {
            showAlertWarning("请选择信息...");
            return false;
        }
        if (select_objs.length > 1) {
            showAlertWarning("一次最多选择1行数据...");
            return false;
        }
        if (NOTNULL(select_objs)) {
            var tmp_g_return = new Object();
            tmp_g_return["status"] = "OK";
            tmp_g_return["g_return"] = select_objs;
            parent.dlg_children.setSafetyInformationReportingNew(tmp_g_return);
            parent.layer.close(g_in_index);
        } else {
            showAlertWarning("请选择一个指标信息！");
        }
        
        
    }
    
    
  //左侧treegrid
	function init_treegrid() {
    	
        var arr_columns = assemble_tg_columns2();
        
        $("#tree").treegrid({
            // url: 'jee/VOrganizationC/listTreegridOperR?menu_sign=assessAllM&group_type=assessAllM1&r=' + Math.random(),
            url: 'jee/VOrganizationC/listAllTreegrid?r=' + Math.random(),
            singleSelect: true,
            method: 'post',
            rownumbers: false,
            loadMsg: '正在加载数据',
            idField: 'id',
            treeField: 'name',
            columns: [arr_columns],
            animate: true,
            onLoadSuccess: onLoadSuccess_tg,
            selectOnCheck: true,
            checkOnSelect: true,
            onSelect: onSelect_tg,
            onDblClickRow: onDblClickRow_tg,
            loadFilter: function (_json) {
                if (_json != null) {
                    if (NOTNULL(_json.status) && _json.status == "success") {
                        if (_json.data.length == 0) {
                            return {"rows": [], "total": 0};
                        }else if (NOTNULL(m_id_org)) {
                            var rows = _json.data.rows;
                            rows = recurrence(rows, m_id_org);
                            return {"rows": rows, "total": rows.length};
                        }
                        return _json.data;
                    } else {
                        showAlertWarning(_json.message);
                        return [];
                    }
                } else {
                    showAlertWarning("返回结果为空,请刷新页面后重试！");
                    return [];
                }
            },
            onBeforeExpand: function (row) {
            	
            	$("#tree").treegrid('select',row.id);
            	
                var url = "jee/VOrganizationC/listVOrganizationTreeById?id_parent=" + row.id;  //新定义的url
                $("#tree").treegrid("options").url = url;  //赋值给treegrid绑定的路径
                return true;
            },
            onLoadError: function (arg) {
            	alert($("#tree").treegrid("options").url +"加载过程失败,status:" + arg.status + "  statusText:" +arg.statusText+  "  readyState:" + arg.readyState );
            }
        });
    }

    //递归查询需要的组织机构及其父级
    function recurrence(rows,id){
        var arr = [];
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            if (row.id == id) {
                arr.push(row);
                arr = arr.concat(recurrence(rows, row.id_parent));
            }
        }
        return arr;
    }

	function onLoadSuccess_tg(row, data) {
    	
    	//默认加载第一行
     	if(is_init){
            if (NOTNULL(m_id_org)) {
                $("#tree").treegrid("select",m_id_org);
            }else{
                var rows = data.rows;
                for (var i = 0; i < rows.length; i++) {
                    var row = rows[i];
                    if ("郑州车务段" == row.name) {
                        $("#tree").treegrid("select",row.id);
                        break;
                    }
                }
                is_init = false;
            }
     	}
	    	
	}
	
	function onDblClickRow_tg(row) {
        if (NOTNULL(row)) {
            if (row.state == "closed") {
                $('#tree').treegrid('expand', row.id);
            }
            else {
                $('#tree').treegrid('collapse', row.id);
            }
            return;
        }
	 }

	function onSelect_tg(rowData) {
        if (NOTNULL(rowData)) {
            m_select_tg_org_rowId = rowData.id;
            m_select_tg_org_rowIndex = rowData.indexs;
            loadDgData("");
        }
    }
    function assemble_tg_columns2() {
        var arr = new Array();
        arr.push({"field": "id", "title": 'id', "width": '1%', "align": 'center', "hidden": true});
        arr.push({"field": "name", "title": '组织名称', "width": '99%', "align": 'left', "halign": 'center'});
        return arr;
    }

    function init_datagrid() {
        var arr_columns = assemble_dg_columns2();
        $("#user_dg").datagrid({
           /* url: "jee/VUserC/getListObjsByIdOrgEnabled",
            queryParams: {
                codes_org: m_codes_org
            },*/
        	toolbar: '#tb',
            method: 'post',
            rownumbers: true,
            nowrap: false,
            loadMsg: '正在加载数据',
            remoteSort: true,
            columns: [arr_columns],
            pageSize: 50,
            pagination: true,
            pageList: [50],
            sortName: 'loginname',
            sortOrder: 'asc',
            idField: "id",
            singleSelect: true,
            selectOnCheck: false,
            checkOnSelect: false,
            view: myview_2,
            emptyMsg: '列表为空',
            onLoadSuccess: onLoadSuccess_dg_user,
            onSelect: onSelect_row_dg_normInfo,
            loadFilter: function (data) {
                return data.data;
            },
            onDblClickRow: onDblClickRow_dg
        });
    }

    function onLoadSuccess_dg_user() {
        // m_data_dg = $("#user_dg").datagrid("getRows");
    }

    function onSelect_row_dg_normInfo() {
    }


    function loadDgData(key){
        if (NOTNULL(m_id_org) && m_select_tg_org_rowId != m_id_org) {
            return;
        }
        $('#user_dg').datagrid('options').url = "jee/VUserC/listObjsByIdOrg?r_=" + Math.random();
        $('#user_dg').datagrid('options').queryParams = {"key": key,"id_org": m_select_tg_org_rowId};
        $('#user_dg').datagrid('reload');
        $("#user_dg").datagrid("unselectAll");
        // ajaxPost("jee/VUserC/listObjsByIdOrg?r=" + Math.random(), {
        //     'id_org':m_select_tg_org_rowId,
        //     'key':key,
        //     'rows':0,
        //     'page':0,
        //     'sort': 'createtime',
        //     'order': 'asc',
        // }, "json", function (_json) {
        //     var arr = _json.data;
        //     $('#user_dg').datagrid('loadData', []);
        //     if (NOTNULL(arr) && arr.rows.length > 0) {
        //         var temp = [];
        //         for (var i = 0; i < arr.rows.length; i++) {
        //             var row = arr.rows[i];
        //             if(NULL(row.name)){
        //                 continue;
        //             }
        //             temp.push(row);
        //         }
        //         $('#user_dg').datagrid('loadData',temp);
        //     }
        // });
    }
    function search_reception() {
        var key = $("#dg_searchbox").searchbox('getValue');
        if (NULL(key)) {
            key = "";
        }
        loadDgData(key);
    }

    function onDblClickRow_dg(rowIndex, rowData) {
        var temp = new Object();
        var rows = $("#dg_select").datagrid("getRows");
        if (rows.length >= 1) {
            layer.msg('一次最多选择1行数据...', {
                time: 1500 //2秒关闭（如果不配置，默认是3秒）
            }, function () {
            });
            return;
        } else {
            // for (var i = 0; i < rows.length; i++) {
            //     var tmp_id = rows[i].id_postduty;
            //     if(NULL(tmp_id)){
            //         tmp_id = rows[i].id;
            //     }
            //     if (rowData.id == tmp_id) {
            //         layer.msg('不能重复选择！', {
            //             time: 1000 //2秒关闭（如果不配置，默认是3秒）
            //         }, function () {
            //         });
            //         return;
            //     }
            // }
            // for(i in rowData){
            //     temp[i] = rowData[i];
            // }
            // temp["id_postduty"] = temp.id;
            // delete temp.id;
            // if(NOTNULL(rowData.createtime)){
            //     delete temp.createtime;
            // }
            // if(NOTNULL(rowData.createuser)){
            //     delete temp.createuser;
            // }
            $("#dg_select").datagrid("appendRow", rowData);
        }

    }

    function assemble_dg_columns2() {
        var arr = new Array();
        arr.push({"field": "id", "title": 'id', "width": '1%', "align": 'center', "hidden": true});
        arr.push({"field": "name", "title": '人员姓名', "width": '70%', "align": 'center',"formatter":formatter_username});
        /*arr.push({"field": "loginname", "title": '用户名', "width": '20%', "align": 'center'});*/
        /*arr.push({"field": "name_postduty", "title": '岗位', "width": '27%', "align": 'center'});*/
//        arr.push({"field": "work_content", "title": '岗位分工', "width": '50%', "align": 'center'});
       /* arr.push({"field": "remarks", "title": '备注', "width": '19%', "align": 'center'});*/
        return arr;
    }
    
    //显示被考核人员
    function formatter_username(value, rowdata, rowIndex) {
        if(NOTNULL(value)){
        	if(NOTNULL(rowdata.name_org)){
        		if(NOTNULL(rowdata.name_postduty)){
        			return rowdata.name_org+"-"+rowdata.name_postduty+"-"+value;
            	}else{
            		return rowdata.name_org+"-"+value;
            	}
        	}else{
        		if(NOTNULL(rowdata.name_postduty)){
        			return rowdata.name_postduty+"-"+value;
            	}else{
            		return value;
            	}
        	}
        }else{
        	return "";
        }
    }


    function onSelect_dg(rowIndex, rowData) {
        m_select_rowId = rowData.id;
        m_select_rowIndex = rowIndex;
        m_select_rowData = rowData;

    }

    function init_datagrid_select() {
        var arr_columns = assemble_dg_columns3();
        $("#dg_select").datagrid({
            idField: "id_postduty",
            //pageSize: 50,
            //pagination: true,
            nowrap: false,
            //pageList: [20, 50, 100, 200, 500, 1000],
            singleSelect: true,
            rownumbers: true,
            //view: myview_2,
            columns: [arr_columns],
            onSelect: onSelect_dg_select,
            onDblClickRow: onDblClickRow_dg_select
            //emptyMsg: '未选择考核人员'
        });
        $("#dg_select").datagrid('loadData',m_arr_rows);
    }

    function assemble_dg_columns3() {
        var arr = new Array();
        arr.push({"field": "id", "title": 'id', "width": '1%', "align": 'center', "hidden": true});
        arr.push({"field": "name", "title": '人员姓名', "width": '70%', "align": 'center',"formatter":formatter_username});
        /*arr.push({"field": "loginname", "title": '用户名', "width": '30%', "align": 'center'});*/
        return arr;
    }
    
    //显示已选被考核人员
    function formatter_username(value, rowdata, rowIndex) {
        if(NOTNULL(rowdata)){
        	if(NOTNULL(rowdata.name_org)){
        		if(NOTNULL(rowdata.name_postduty)){
        			return rowdata.name_org+"-"+rowdata.name_postduty+"-"+value;
            	}else{
            		return rowdata.name_org+"-"+value;
            	}
        	}else{
        		if(NOTNULL(rowdata.name_postduty)){
        			return rowdata.name_postduty+"-"+value;
            	}else{
            		return value;
            	}
        	}
        }else{
        	return "-";
        }
    }

    //分值的编辑
    function formatter_count(value, rowdata, rowIndex) {

	 	var number = Number(value);  
	    if (isNaN(number)) {  
	        return '';  
	    } else {  
	    	return gfnull_float(number);
	    }  
	}
    
    function onDblClickRow_dg_select(rowIndex, rowData) {
        $("#dg_select").datagrid("deleteRow", rowIndex);
    }


    function onSelect_dg_select(rowIndex, rowData) {
        m_select_rowId_select = rowData.id;
        m_select_rowIndex_select = rowIndex;
        m_select_rowData_select = rowData;

    }

    function onClick_addOne() {
        var selectedRow = $("#user_dg").datagrid("getSelected");

        if (NULL(selectedRow)) {
            showAlertWarning("请选择一条数据...");
            return false;
        }

        var rows = $("#dg_select").datagrid("getRows");
        if (rows.length >= 1) {
            layer.msg('一次最多选择1行数据...', {
                time: 1500
            }, function () {
            });
            return;
        } else {
            for (var i = 0; i < rows.length; i++) {
                var tmp_id = rows[i].id_postduty;
                if(NULL(tmp_id)){
                    tmp_id = rows[i].id;
                }
                if (selectedRow.id == tmp_id) {
                    layer.msg('不能重复选择！', {
                        time: 1000
                    }, function () {
                    });
                    return;
                } else {

                }
            }
            // var temp = {};
            // for(i in selectedRow){
            //     temp[i] = selectedRow[i];
            // }
            // temp["id_postduty"] = temp.id;
            // delete temp.id;
            // if(NOTNULL(selectedRow.createtime)){
            //     delete temp.createtime;
            // }
            // if(NOTNULL(selectedRow.createuser)){
            //     delete temp.createuser;
            // }
            $("#dg_select").datagrid("appendRow", selectedRow);
        }
    }

    function onClick_addAll() {
        var selectedRows = $("#user_dg").datagrid("getRows");

        if (NULL(selectedRows)) {
            showAlertWarning("请选择一条数据...");
            return false;
        }

        var rows = $("#dg_select").datagrid("getRows");
        if (rows.length >= 1) {
            layer.msg('一次最多选择1行数据...', {
                time: 1500
            }, function () {
            });
            return;
        } else {
            var tmp_flag_repeat = false;
            for (var j = 0; j < selectedRows.length; j++) {
                var tmp_selectedRow = selectedRows[j];
                var tmp_flag_insert = true;
                for (var i = 0; i < rows.length; i++) {
                    // var tmp_id = rows[i].id_postduty;
                    var tmp_id = rows[i].id;
                    if (tmp_selectedRow.id == tmp_id) {
                        tmp_flag_repeat = true;
                        tmp_flag_insert = false;
                        break;
                    }
                }
                // var temp = {};
                // for(i in tmp_selectedRow){
                //     temp[i] = tmp_selectedRow[i];
                // }
                // temp["id_postduty"] = tmp_selectedRow.id;
                // delete temp.id;
                // if(NOTNULL(temp.createtime)){
                //     delete temp.createtime;
                // }
                // if(NOTNULL(temp.createuser)){
                //     delete temp.createuser;
                // }
                if (tmp_flag_insert) {
                    $("#dg_select").datagrid("appendRow", selectedRows);
                }
            }

            if (tmp_flag_repeat) {
                showmsgWarning("已自动过滤重复数据！");
            }
        }
    }
    
    function onClick_minusOne() {
        var selectedRow = $("#dg_select").datagrid("getSelected");
        var selectedRowIndex = $("#dg_select").datagrid("getRowIndex", selectedRow);

        if (NULL(selectedRow)) {
            showAlertWarning("请选择一条数据...");
            return false;
        }
        $("#dg_select").datagrid("deleteRow", selectedRowIndex);
    }

    function onClick_minusAll() {
        var rows = $("#dg_select").datagrid("getRows");

        for (var i = rows.length - 1; i >= 0; i--) {
            var index = $('#dg_select').datagrid('getRowIndex', rows[i]);
            $("#dg_select").datagrid("deleteRow", index);
        }
    }
}

$.extend($.fn.datagrid.methods, {
    editCell: function(jq,param){
        return jq.each(function(){
            var opts = $(this).datagrid('options');
            var fields = $(this).datagrid('getColumnFields',true).concat($(this).datagrid('getColumnFields'));
            for(var i=0; i<fields.length; i++){
                var col = $(this).datagrid('getColumnOption', fields[i]);
                col.editor1 = col.editor;
                if (fields[i] != param.field){
                    col.editor = null;
                }
            }
            $(this).datagrid('beginEdit', param.index);
            var ed = $(this).datagrid('getEditor', param);
            if (ed){
                if ($(ed.target).hasClass('textbox-f')){
                    $(ed.target).textbox('textbox').focus();
                    $(ed.target).textbox('textbox').select();

                    $(ed.target).textbox('textbox').keydown(function(e) {
                        if (e.keyCode == 13) {
                        /*170111$("#total_paid").textbox('textbox').focus();
                        $("#total_paid").textbox('textbox').select();*/
                        }
                    });
                    $(ed.target).textbox('textbox').blur(function(event) {
                        var selectedRow = $("#dg_select").datagrid("getSelected");
                        var score = $(ed.target).textbox('getValue');
                        if (isNaN(Number(score))) {
                            score = 0;
                        }
                        selectedRow[param.field] = score;
                        $("#dg_select").datagrid("refreshRow", param.index);
                        //170111  calculate_total(param.index);
                    });
                } else {
                    $(ed.target).focus();
                }
            }
            for(var i=0; i<fields.length; i++){
                var col = $(this).datagrid('getColumnOption', fields[i]);
                col.editor = col.editor1;
            }
        });
    },
    enableCellEditing: function(jq){
        return jq.each(function(){
            var dg = $(this);
            var opts = dg.datagrid('options');
            opts.oldOnClickCell = opts.onClickCell;
            opts.onClickCell = function(index, field){
                if (opts.editIndex != undefined){
                    if (dg.datagrid('validateRow', opts.editIndex)){
                        dg.datagrid('endEdit', opts.editIndex);
                        opts.editIndex = undefined;
                    } else {
                        return;
                    }
                }
                dg.datagrid('selectRow', index).datagrid('editCell', {
                    index: index,
                    field: field
                });
                opts.editIndex = index;
                opts.oldOnClickCell.call(this, index, field);

            }
        });
    }
});

