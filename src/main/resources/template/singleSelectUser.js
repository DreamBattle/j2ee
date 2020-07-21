/**
 * @author zhangshizhe
 * @date 2018-9-20
 */
$(function () {
    fun_nodeSelectProcessor();
});

function fun_nodeSelectProcessor() {

    var m_selected_user_dg_rowId = "";
    var m_selected_user_dg_rowIndex = 0;

    var m_select_tg_org_rowId = "";
    var m_select_tg_org_rowIndex = 0;
    var m_arr_rows = [];
    var m_id_org = "";
    var is_init = true ;//第一次默认加载第一行
    init_fun_nodeSelectProcessor();

    function init_fun_nodeSelectProcessor() {

        if (NOTNULL(g_in_data)) {
            g_in_obj = $.parseJSON(g_in_data);
            m_arr_rows = g_in_obj.arr;
            m_id_org = g_in_obj.org;
        } else {
            showAlertErr("输入参数获取失败，请刷新后重试...");
            return;
        }
        init_user_dg();
        init_treegrid();
    }

    //左侧treegrid
    function init_treegrid() {
        var arr_columns = assemble_tree_columns2();
        $("#tg").treegrid({
            // url: 'jee/VOrganizationC/listVOrgTreeByIdParent?id_parent=' + m_id_org,
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
                var url = "jee/VOrganizationC/listVOrganizationTreeById?id_parent=" + row.id;  //新定义的url
                $("#tg").treegrid("options").url = url;  //赋值给treegrid绑定的路径
                return true;
            },
            onLoadError: function (arg) {
            	alert($("#tg").treegrid("options").url +"加载过程失败,status:" + arg.status + "  statusText:" +arg.statusText+  "  readyState:" + arg.readyState );
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
                $("#tg").treegrid("select",m_id_org);
            }else{
                var rows = data.rows;
                for (var i = 0; i < rows.length; i++) {
                    var row = rows[i];
                    if ("新乡车务段" == row.name) {
                        $("#tg").treegrid("select",row.id);
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
                $('#tg').treegrid('expand', row.id);
            }
            else {
                $('#tg').treegrid('collapse', row.id);
            }
            return;
        }
    }

    function onSelect_tg(rowData) {
        // m_select_tg_org_rowId = rowData.id;
        // console.log(m_select_tg_org_rowId);
        // m_select_tg_org_rowIndex = rowData.indexs;
        // $("#title_data").html(rowData.name);
        // search_reception();
        if (NOTNULL(rowData)) {
            m_select_tg_org_rowId = rowData.id;
            m_select_tg_org_rowIndex = rowData.indexs;
            loadDgData("");
        }
    }


    function assemble_tree_columns2() {
        var arr = new Array();
        arr.push({"field": "id", "title": 'id', "width": '1%', "align": 'center', "hidden": true});
        arr.push({"field": "name", "title": '组织机构名称', "width": '98%', "align": 'left'});
        return arr;
    }

    //初始化用户数据列表
    function init_user_dg() {
        var arr_columns = assemble_columns();
        $("#dg").datagrid({
            toolbar: '#tb',
            pagination: true,
            pageList: [20, 50, 100, 200, 500, 1000],
            pageSize: 100,
            rownumbers: true,
            nowrap: false,
            loadMsg: '正在加载数据',
            //loadFilter: pagerFilter,
            remoteSort: true,
            columns: [arr_columns],
            idField: "id",
            singleSelect: true,
            selectOnCheck: false,
            checkOnSelect: false,
            sortName: 'createtime',
            sortOrder: 'desc',
            view: myview_2,
            emptyMsg: '列表为空',
            onLoadSuccess: onLoadSuccess_dg,
            onSelect: onSelect_row_dg,
            onDblClickRow: onDblClickRow,
            // loadFilter: function (_json) {
            //     if (_json != null) {
            //         if (NOTNULL(_json.status) && _json.status == "success") {
            //             if (_json.data.length == 0) {
            //                 return {"rows": [], "total": 0};
            //             }
            //             return _json.data;
            //         } else {
            //             showAlertWarning(_json.message);
            //             return [];
            //         }
            //     } else {
            //         showAlertWarning("返回结果为空,请刷新页面后重试！");
            //         return [];
            //     }
            // }
            loadFilter: function (data) {
                return data.data;
            },
        });

        $("#dg_searchbox").searchbox({
            width: '300',
            height: '30',
            prompt: '请输入岗位名称查找...',
            searcher: function (e) {
                search_reception();
            }
        });

        $('body').on("click", "#btnSaveSingle", function () {
            packingSaveObj();
        });
    }

    function loadDgData(key){
        if (NOTNULL(m_id_org) && m_select_tg_org_rowId != m_id_org) {
            return;
        }
        $('#dg').datagrid('options').url = "jee/VUserC/listObjsByIdOrg?r_=" + Math.random();
        $('#dg').datagrid('options').queryParams = {"key": key,"id_org": m_select_tg_org_rowId};
        $('#dg').datagrid('reload');
        $("#dg").datagrid("unselectAll");
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

    // function search_reception() {
    //     var key = $("#dg_searchbox").searchbox('getValue');
    //     if (key == null || key == "") {
    //         key = "";
    //     }
    //
    //     $('#dg').datagrid('options').url = "jee/VPostdutyC/listPostdutysByIdOrg?r_=" + Math.random();
    //     $('#dg').datagrid('options').queryParams = {"id_org": m_select_tg_org_rowId, "key": key};
    //     $('#dg').datagrid('load');
    // }

    function assemble_columns() {
        var arr = new Array();

        arr.push({"field": "id", "title": 'id', "width": '1%', "align": 'center', "hidden": true});
        // arr.push({"field": "id_postduty", "title": 'postduty', "width": '1%', "align": 'center', "hidden": true});
        arr.push({"field": "name", "title": '用户名称', "width": '65%', "align": 'center', "sortable": true});
        // arr.push({"field": "loginname", "title": '用户名', "width": '15%', "align": 'center', "sortable": true});
        // arr.push({"field": "name_org", "title": '所属组织', "width": '33%', "align": 'center', "sortable": true});
        // arr.push({"field": "createtime", "title": '登记时间', "width": '20%', "align": 'center', "sortable": true});
        arr.push({"field": "remarks", "title": '备注', "width": '33%', "align": 'center'});

        return arr;
    }

    function onLoadSuccess_dg(data) {
        // alert(data);
        if (NOTNULL(data) && NOTNULL(data.rows) && data.rows.length > 0) {
            if (NOTNULL(m_selected_user_dg_rowId)) {
                $("#dg").datagrid("clearSelections");
                $("#dg").datagrid("selectRecord", m_selected_user_dg_rowId);
                var tmp = $("#dg").datagrid("getSelected");
                if (NULL(tmp)) {
                    m_selected_user_dg_rowIndex = 0;
                    $("#dg").datagrid("selectRow", m_selected_user_dg_rowIndex);
                }
            } else {
                if (m_selected_user_dg_rowIndex >= data.rows.length) {
                    m_selected_user_dg_rowIndex = data.rows.length - 1;
                }
                $("#dg").datagrid("selectRow", m_selected_user_dg_rowIndex);
            }
            if (m_arr_rows.length > 0) {
                for (var i = 0; i < m_arr_rows.length; i++) {
                    var row = m_arr_rows[i];
                    $("#dg").datagrid("selectRecord", row.id);
                }
            }
        } else {
            $("#dg").datagrid("clearSelections");
        }
        pagerFilterEnd();
    }

    function pagerFilterEnd() {
        // datagrid的数据加载完成后，设置搜索框获取焦点。
        if ($("#dg_searchbox").length > 0) {
            setTimeout(function () {
                $("#dg_searchbox").searchbox("textbox").focus();
            }, 500);
        }
        ;
    }

    function onSelect_row_dg(rowIndex, rowData) {
        m_selected_user_dg_rowId = rowData.id;
        m_selected_user_dg_rowIndex = rowIndex;
    }


    function onDblClickRow(rowIndex, rowData) {
        packingSaveObj(rowData);
        // if (NULL(rowData)) {
        //     return;
        // }
        //
        // var tmp_g_return = new Object();
        // tmp_g_return["status"] = "OK";
        // tmp_g_return["g_return"] = rowData;
        // parent.dlg_children.setSafetyInformationReportingNew(tmp_g_return);
        // parent.layer.close(g_in_index);
    }

    function packingSaveObj() {

        var rowData = $("#dg").datagrid("getSelected");

        if (NULL(rowData)) {
            showAlertWarning('当前组织下没有可选人员...');
            return;
        }

        var tmp_g_return = new Object();
        tmp_g_return["status"] = "OK";
        tmp_g_return["g_return"] = rowData;
        parent.dlg_children.setSafetyInformationReportingNew(tmp_g_return);
        parent.layer.close(g_in_index);
    }

}

