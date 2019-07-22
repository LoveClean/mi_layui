layui.use(['form', 'layer', 'table'], function () {
        const form = layui.form,
            layer = parent.layer === undefined ? layui.layer : top.layer,
            $ = layui.jquery,
            table = layui.table;

        //列表
        const tableIns = table.render({
            elem: '#list',
            url: $.cookie("tempUrl") + 'productCategory/selectList',
            where: {token: $.cookie("token")},
            method: "GET",
            request: {
                pageName: 'pageNum' //页码的参数名称，默认：page
                , limitName: 'pageSize' //每页数据量的参数名，默认：limit
            },
            response: {
                statusName: 'code' //数据状态的字段名称，默认：code
                , statusCode: 0 //成功的状态码，默认：0
                , msgName: 'httpStatus' //状态信息的字段名称，默认：msg
                , countName: 'totalElements' //数据总数的字段名称，默认：count
                , dataName: 'content' //数据列表的字段名称，默认：data
            },
            cellMinWidth: 95,
            page: true,
            height: "full-25",
            limits: [5, 10, 15, 20, 25],
            limit: 15,
            id: "dataTable",
            toolbar: '#toolbarDemo',
            defaultToolbar: [],
            cols: [[
                {field: 'categoryId', title: 'ID', width: 70, align: 'center'},
                {
                    field: 'categoryCover', title: '广告图', width: 110, align: "left", templet: function (d) {
                        return d.categoryCover ? '<img src="' + d.categoryCover + '" height="30px"/>' : '<label style="color: #9F9F9F">无</label>';
                    }
                },
                {field: 'categorySort', title: '序号', width: 70, align: 'center'},
                {
                    field: 'categoryName', title: '标题', minWidth: 70, align: "left", templet: function (d) {
                        return '<a lay-event="edit" style="cursor:pointer;color: #01AAED">' + d.categoryName + '</a>';
                    }
                },
                // {field: 'introduction', title: '简介', minWidth: 300, align: 'left'},
                {
                    field: 'createDate', title: '创建时间', width: 200, align: "center", templet: function (d) {
                        return d.createDate;
                    }
                },
                {
                    field: 'status', title: '状态', width: 100, align: 'center', templet: function (d) {
                        if (d.status === 1) {
                            return '<input type="checkbox" lay-filter="status" lay-skin="switch" value=' + d.categoryId + ' lay-text="可见|不可见" checked>';
                        } else if (d.status === 0) {
                            return '<input type="checkbox" lay-filter="status" lay-skin="switch" value=' + d.categoryId + ' lay-text="可见|不可见" >';
                        }
                    }
                },
                {title: '操作', width: 145, templet: '#userListBar', fixed: "right", align: "center"}
            ]]
        });

        //头工具栏事件
        table.on('toolbar(test)', function (obj) {
            const checkStatus = table.checkStatus(obj.config.id);
            switch (obj.event) {
                case 'search_btn':
                    table.reload("dataTable", {
                        url: $.cookie("tempUrl") + 'productCategory/selectListByTitle',
                        where: {
                            title: $(".searchVal").val(),
                            token: $.cookie("token")
                        }
                    });
                    break;
                case 'flash_btn':
                    window.location.reload();
                    break;
                case 'add_btn':
                    const index = layui.layer.open({
                        title: "新增商品品类",
                        type: 2,
                        area: ["500px", "440px"],
                        content: "productCategoryAdd.html",
                        shadeClose: true
                    });
                    break;
            }
        });

        // 修改状态开关
        form.on('switch(status)', function (data) {
            // console.log(data.elem.checked); //开关是否开启，true或者false
            // console.log(data.value); //开关value值，也可以通过data.elem.value得到
            $.ajax({
                url: $.cookie("tempUrl") + "productCategory/updateByStatus?token=" + $.cookie("token"),
                type: "PUT",
                datatype: "application/json",
                contentType: "application/json;charset=utf-8",
                data: JSON.stringify({
                    "id": data.value,
                    "status": data.elem.checked ? "1" : "0"
                }),
                success: function (result) {
                    if (result.httpStatus === 200) {
                        layer.msg("状态修改成功");
                    } else {
                        layer.alert(result.exception, {icon: 7, anim: 6});
                    }
                }
            });
        });

        //列表操作
        table.on('tool(test)', function (obj) {
            const layEvent = obj.event,
                data = obj.data;
            switch (layEvent) {
                case 'edit'://编辑
                    const index = layui.layer.open({
                        title: "查看/更新资讯",
                        type: 2,
                        area: ["500px", "440px"],
                        content: "productCategoryUpd.html",
                        shadeClose: true,
                        success: function (layero, index) {
                            const body = layui.layer.getChildFrame('body', index);
                            body.find("#demo1").attr("src", data.categoryCover);  //封面图
                            // console.log(data.cover);
                            body.find(".categoryId").val(data.categoryId);
                            body.find(".categoryName").val(data.categoryName);
                            body.find(".categorySort").val(data.categorySort);
                            form.render();
                        }
                    });
                    break;
                case 'del'://删除
                    layer.confirm('确定删除？', {icon: 3, title: '提示信息'}, function (index) {
                        $.ajax({
                            url: $.cookie("tempUrl") + "productCategory/deleteByPrimaryKey?token=" + $.cookie("token") + "&id=" + data.categoryId,
                            type: "DELETE",
                            success: function (result) {
                                layer.msg("删除成功");
                                // window.location.href = "productCategoryList.html";
                            }
                        });
                        obj.del(); //删除对应行（tr）的DOM结构，并更新缓存
                        // tableIns.reload();
                        layer.close(index);
                    });
                    break;
            }
        });
    }
);
