function selectUser(type) {
    var ids = $('#' + type).textbox('getValue');
    var names = $('#' + type).textbox('getText');
    var ids_arr = [];
    var names_arr = [];
    var arr = [];
    if (NOTNULL(names)) {
        if (names.indexOf(",") > -1) {
            names_arr = names.split(",");
        }
    }
    if (NOTNULL(ids)) {
        if (ids.indexOf(",") > -1) {
            ids_arr = ids.split(",");
            for (var i = 0; i < ids_arr.length; i++) {
                var id = ids_arr[i];
                var name = names_arr[i];
                arr.push({"id": id, "name": name});
            }
        } else {
            arr.push({"id": ids, "name": names});
        }
    }
    var id_org = "";
    if ('id_accept_user' == type) {//收报人选择收报单位下的
        id_org = $('#id_accept_org').textbox('getValue');
    }
    var iData = {"arr":arr, "org": id_org};
    var indexs = parent.layer.open({
        type: 2,//iframe 类型
        title: "选择用户信息",
        shadeClose: false,//点击遮罩层是否关闭
        shade: 0.3,//遮罩层系数
        scrollbar: false,//滚动条，后期可能会改
        anim: 5,//打开动画
        maxmin: true,//最大最小化按钮
        content: ["view/emergency/singleSelectUser?r=" + Math.random() + "&data=" + URLJSON(iData), 'no'], //这里content是一个URL，如果你不想让iframe出现滚动条，你还可以content: ['http://sentsin.com', 'no']
        area: setDlgSize(3),//iframe 页面大小
        id: "singleSelectUser",//iframe 页面ID
        resize: true,//不允许拉伸
        success: function (layero, index) {// 弹出成功之后，隐藏最小化按钮
            // layero.find('.layui-layer-min').hide();//加载成功后吟唱最小化按钮
        },
        cancel: function () {//取消事件

        },
        end: function () {//层销毁事件
            var r_return = parent.dlg_children.getSafetyInformationReportingNew();
            if (NOTNULL(r_return) && r_return.status == "OK") {
                if (NOTNULL(r_return.g_return)) {
                    var r_obj = r_return.g_return;
                    $('#'+type).textbox('setValue', r_obj["id"]);
                    $('#'+type).textbox('setText', r_obj["name"]);
                    $('#'+type).attr('id_org', r_obj["id_org"]);
                }
            }
            parent.dlg_children.setSafetyInformationReportingNew("");
        }
    });
}