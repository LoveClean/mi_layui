layui.use(['form', 'layer', 'table'], function () {
        const form = layui.form,
            layer = parent.layer === undefined ? layui.layer : top.layer,
            $ = layui.jquery,
            table = layui.table;

        //列表
        const tableIns = table.render({
            elem: '#list',
            url: $.cookie("tempUrl") + 'product/selectList',
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
                {field: 'productId', title: 'ID', width: 70, align: 'center'},
                {
                    field: 'productCover', title: 'logo', width: 60, align: "left", templet: function (d) {
                        return '<img src="' + d.productCover + '" height="30px"/>';
                    }
                },
                {
                    field: 'productName', title: '商品名称', minWidth: 200, align: "left", templet: function (d) {
                        return '<a lay-event="edit" style="cursor:pointer;color: #01AAED">' + d.productName + '</a>';
                    }
                },
                {field: 'categoryName', title: '类别', minWidth: 90, align: 'left'},
                {
                    field: 'productPromotion', title: '促销语', minWidth: 200, align: 'left', templet: function (d) {
                        return d.productPromotion !== "" ? d.productPromotion : "<label style='color: #c2c2c2'>无</label>"
                    }
                },
                {field: 'productIntroduction', title: '简介', minWidth: 300, align: 'left'},
                {
                    field: 'createDate', title: '创建时间', width: 200, align: "center", templet: function (d) {
                        return d.createDate;
                    }
                },
                {
                    field: 'status', title: '状态', width: 100, align: 'center', templet: function (d) {
                        if (d.status === 1) {
                            return '<input type="checkbox" lay-filter="status" lay-skin="switch" value=' + d.productId + ' lay-text="可见|不可见" checked>';
                        } else if (d.status === 0) {
                            return '<input type="checkbox" lay-filter="status" lay-skin="switch" value=' + d.productId + ' lay-text="可见|不可见" >';
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
                        url: $.cookie("tempUrl") + 'product/selectListByTitle',
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
                        title: "新增商品",
                        type: 2,
                        area: ["500px", "280px"],
                        content: "productAdd.html",
                        shadeClose: true,
                        success: function () {
                            setTimeout(function () {
                                layui.layer.tips('点击此处关闭', '.layui-layer-setwin .layui-layer-close', {
                                    tips: 3
                                });
                            }, 100)
                        }
                    });
                    layui.layer.full(index);
                    window.sessionStorage.setItem("index", index);
                    //改变窗口大小时，重置弹窗的宽高，防止超出可视区域（如F12调出debug的操作）
                    $(window).on("resize", function () {
                        layui.layer.full(window.sessionStorage.getItem("index"));
                    });
                    break;
            }
        });

        // 修改状态开关
        form.on('switch(status)', function (data) {
            // console.log(data.elem.checked); //开关是否开启，true或者false
            // console.log(data.value); //开关value值，也可以通过data.elem.value得到
            $.ajax({
                url: $.cookie("tempUrl") + "product/updateByStatus?token=" + $.cookie("token"),
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
                        title: "查看/更新商品",
                        type: 2,
                        content: "productUpd.html",
                        success: function (layero, index) {
                            const body = layui.layer.getChildFrame('body', index);
                            body.find("#demo1").attr("src", data.productCover);  //封面图
                            // console.log(data.cover);
                            body.find(".id").val(data.productId);
                            body.find(".productName").val(data.productName);
                            body.find(".productPromotion").val(data.productPromotion);
                            body.find(".productIntroduction").val(data.productIntroduction);
                            // body.find('.product').siblings("div.layui-form-select").find('dl').find('dd[lay-value=' + data.product + ']').click();  //文章分类
                            body.find(".createDate").val(data.createDate);
                            form.render();
                            setTimeout(function () {
                                layui.layer.tips('点击此处关闭', '.layui-layer-setwin .layui-layer-close', {
                                    tips: 3
                                });
                            }, 100);
                        }
                    });
                    layui.layer.full(index);
                    window.sessionStorage.setItem("index", index);
                    //改变窗口大小时，重置弹窗的宽高，防止超出可视区域（如F12调出debug的操作）
                    $(window).on("resize", function () {
                        layui.layer.full(window.sessionStorage.getItem("index"));
                    });
                    break;
                case 'del'://删除
                    layer.confirm('确定删除？', {icon: 3, title: '提示信息'}, function (index) {
                        $.ajax({
                            url: $.cookie("tempUrl") + "product/deleteByPrimaryKey?token=" + $.cookie("token") + "&id=" + data.productId,
                            type: "DELETE",
                            success: function (result) {
                                layer.msg("删除成功");
                                // window.location.href = "productList.html";
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
