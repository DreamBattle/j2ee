/**
* @author zhangshizhe
* @date 2020年04月03日 15:00:59
*/
$(function () {
    fun_selectOrg();
});

function fun_selectOrg() {
    var m_flag_tree_check = true;
    var m_flag_tree_uncheck = true;
    var m_selected_dg_rowId = "";
    var m_selected_arr_rowId = [];
    var m_flag = true;//第一次加载成功回显
    var m_flag_select = false;//第一次选择回显不选中子级
    init_fun();

    function init_fun() {
        if (NOTNULL(g_in_data)) {
            g_in_obj = $.parseJSON(g_in_data);
            m_selected_arr_rowId = g_in_obj.arr;
        } else {
            showAlertErr("输入参数获取失败，请刷新后重试...", function () {
                parent.layer.close(g_in_index);
            });
            return;
        }

        init_control();
        init_treegrid();

        layer.config({
            extend: 'enter/layer.css', // 加载您的扩展样式
            skin: 'layer-ext-enter'
        });
    }

    function selectIds(){
        for (var i = 0; i < m_selected_arr_rowId.length; i++) {
            var id = m_selected_arr_rowId[i];
            $("#tree").treegrid('checkRow', id);
        }
    }

    function init_control() {
        $('body').on("click", "#btnSaveSingle", function () {
            packingSaveObj();
        });
    }

    //初始化用户数据列表
    function init_treegrid() {
        var arr_columns = assemble_tg_columns2();
        $("#tree").treegrid({
            url: 'jee/VOrganizationC/listTreegridBeforeTwo?r=' + Math.random(),
            // url: 'jee/VOrganizationC/listTreegridOperR?menu_sign=questionM&group_type=questionM0&r=' + Math.random(),
            singleSelect: false,
            toolbar: '#tb',
            method: 'post',
            rownumbers: false,
            columns: [arr_columns],
            loadMsg: '正在加载数据',
            idField: 'id',
            treeField: 'name',
            animate: true,
            onLoadSuccess: onLoadSuccess_tg,
            selectOnCheck: false,
            checkOnSelect: false,
            onBeforeExpand: function (row) {
                $("#tree").treegrid("select",row.id);
                var url = "jee/VOrganizationC/listVOrganizationTreeById?id_parent=" + row.id;  //新定义的url
                $("#tree").treegrid("options").url = url;  //赋值给treegrid绑定的路径
                return true;
            },
            onLoadError: function (arg) {
                alert($("#tree").treegrid("options").url +"加载过程失败,status:" + arg.status + "  statusText:" +arg.statusText+  "  readyState:" + arg.readyState );
            },
            loadFilter: function (data, parentId) {
                return data.data;
            },
            onDblClickRow: function (row) {
                if (NOTNULL(row.id)) {
                    $("#tree").treegrid('toggle',row.id);
                }
            },
            // onCheck:checkRow,
            // onUncheck:unCheckRow,
        });
    }

    function checkRow(row){
        if (NULL(row)||NULL(row.id)) {
            return;
        }
        if (m_flag_tree_check) {//避免递归多次进入，优化速度
            //选中父节点默认勾选所有子节点
            var arr = $("#tree").treegrid('getChildren', row.id);
            if (arr.length > 0) {
                for (var i = 0; i < arr.length; i++) {
                    var temp = arr[i];
                    $("#tree").treegrid('checkRow',temp.id);
                }
            }
        }
        m_flag_tree_check = true;
        //选中子节点，判断若所有兄弟节点都选中了，则勾选父节点
        var obj = $("#tree").treegrid('getParent', row.id);//获取父节点
        if (NOTNULL(obj)) {
            var selections = $("#tree").treegrid('getChecked');//获取所有选中节点
            if (selections.indexOf(obj) == -1) {//判断父节点是否没选中，以免递归速度缓慢
                var children = $("#tree").treegrid('getChildren', obj.id);//获取所有子节点
                if (selections.length >= children.length) {
                    //判断是否选中了所有子节点
                    var parent_flag = true;
                    for (var i = 0; i < children.length; i++) {
                        var child = children[i];
                        var flag = false;
                        for (var j = 0; j < selections.length; j++) {
                            var select = selections[j];
                            if (child.id == select.id) {
                                flag = true;
                                break;
                            }
                        }
                        if (!flag) {//有没选中的
                            parent_flag = false;
                            break;
                        }
                    }
                    if (parent_flag) {
                        m_flag_tree_check = false;
                        $("#tree").treegrid('checkRow',obj.id);
                    }
                }
            }
        }
    }

    function unCheckRow(row){
        if (NULL(row)||NULL(row.id)) {
            return;
        }
        //取消选中父节点默认取消勾选所有子节点
        if (m_flag_tree_uncheck) {
            var arr = $("#tree").treegrid('getChildren', row.id);
            if (arr.length > 0) {
                for (var i = 0; i < arr.length; i++) {
                    var temp = arr[i];
                    $("#tree").treegrid('uncheckRow',temp.id);
                }
            }
        }
        var obj = $("#tree").treegrid('getParent', row.id);
        m_flag_tree_uncheck = true;
        //取消子节点若父节点已勾选，则取消父节点勾选
        if (NOTNULL(obj)) {
            var selections = $("#tree").treegrid('getChecked');
            if (selections.indexOf(obj) > -1) {//判断父节点是否选中，以免递归速度缓慢
                m_flag_tree_uncheck = false;
                $("#tree").treegrid('uncheckRow', obj.id);
            }
        }
    }

    function assemble_tg_columns2() {
        var arr = new Array();
        arr.push({"field": "ck", checkbox: true, "hidden": false});
        arr.push({"field": "id", "title": 'id', "width": '1%', "align": 'center', "hidden": true});
        arr.push({"field": "name", "title": '组织名称', "width": '35%', "align": 'left', "halign": 'center'});
        arr.push({"field": "codes", "title": '机构编码', "width": '15%', "align": 'center', "halign": 'center'});
        arr.push({"field": "label", "title": '组织机构类型', "width": "23%", "align": 'center', "halign": 'center'});
        arr.push({"field": "fullname", "title": '组织机构全称 ', "width": '25%', "align": 'center', "halign": 'center'});
        return arr;
    }

    function onLoadSuccess_tg(row, data) {
        if (m_flag&&m_selected_arr_rowId.length!=0) {//第一次加载成功回显
            m_flag_select = true;
            selectIds();
            m_flag = false;
            m_flag_select = false;
        }
        if (NOTNULL(data) && NOTNULL(data.rows) && data.rows.length > 0) {
            if (NOTNULL(m_selected_dg_rowId)) {
                $("#dg").treegrid("select", m_selected_dg_rowId);
            } else {
                $("#dg").treegrid("clearSelections");
            }
        } else {
            $("#dg").treegrid("clearSelections");
        }
    }

    function onDblClickRow_tg(row) {
        // packingSaveObj();
        $("#tree").treegrid("toggle",row.id);
    }

    function onSelect_row_dg(rowData){
        if (NULL(rowData)) {
            return;
        }
        m_selected_dg_rowId = rowData.id;
        if (rowData.label != "部门" ) {
            showmsgWarning('请选择机构类型为部门的组织机构！');
            $("#tree").treegrid("unselect",rowData.id);
            return false;
        }else if (!m_flag_select) {
            var arr = $("#tree").treegrid("getChildren",rowData.id);
            for (var i = 0; i < arr.length; i++) {
                var row = arr[i];
                $("#tree").treegrid("select",row.id);
            }
        }
    }

    function onUnselect_row_dg(rowData){
        var arr = $("#tree").treegrid("getChildren",rowData.id);
        for (var i = 0; i < arr.length; i++) {
            var row = arr[i];
            $("#tree").treegrid("unselect",row.id);
        }
    }

    function oncheck_row_tg(rowData){
        if (NULL(rowData)) {
            return;
        }
        m_selected_dg_rowId = rowData.id;
        if (rowData.label != "部门" ) {
            showmsgWarning('请选择机构类型为部门的组织机构！');
            $("#tree").treegrid("unselect",rowData.id);
            return false;
        }
    }

    function packingSaveObj() {
        var selectedRows = $("#tree").treegrid("getChecked");
        if (NULL(selectedRows) || selectedRows.length < 1) {
            showAlertWarning('请选择一行数据...');
            return false;
        }
        var returnObj = new Object();
        //returnObj["arr"] = [];
        returnObj["id"] = "";
        returnObj["name"] = "";
        if (NOTNULL(selectedRows)) {
            for (var i = 0; i < selectedRows.length; i++) {
                // if(selectedRows[i].label != "部门"){
                //     showAlertWarning('请选择机构类型为部门的组织机构！');
                //     return false;
                // }
                returnObj["id"] += selectedRows[i].id;
                returnObj["name"] += selectedRows[i].name;
                //returnObj["arr"].push({id_org: selectedRows[i].id, name_org: selectedRows[i].name});
                if (i != selectedRows.length - 1) {
                    returnObj["id"] += ",";
                    returnObj["name"] += ",";
                }
            }
        }
        var tmp_g_return = new Object();
        tmp_g_return["status"] = "OK";
        tmp_g_return["g_return"] = returnObj;
        parent.dlg_children.setNormInfoNew(tmp_g_return);
        parent.layer.close(g_in_index);
    }

}

