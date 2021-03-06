layui.use(['form', 'layer', 'layedit', 'upload'], function () {
    const form = layui.form,
        layer = parent.layer === undefined ? layui.layer : top.layer,
        upload = layui.upload,
        layedit = layui.layedit,
        $ = layui.jquery;

    //加载商品品类
    $.ajax({
        url: $.cookie("tempUrl") + "productCategory/selectList?token=" + $.cookie("token") + "&pageNum=1&pageSize=99",
        type: "GET",
        success: function (result) {
            if (result.code === 0) {
                // console.log(result.content);
                $.each(result.content,
                    function (index, item) {
                        $(".productCategory").append($('<option value=' + item.categoryId + '>' + item.categoryName + '</option>'));
                    });
                form.render();
            } else {
                layer.alert(result.exception, {icon: 7, anim: 6});
            }
        }
    });

    //创建一个编辑器
    const editIndex = layedit.build('news_content', {
        height: 500,
        uploadImage: {
            url: $.cookie("tempUrl") + 'file/uploadImageEdit?token=' + $.cookie("token")
        }
    });

    //封面图上传
    let coverUrl = null;
    const uploadInst = upload.render({
        elem: '#test1'
        , url: $.cookie("tempUrl") + 'file/uploadImage?token=' + $.cookie("token")
        , method: 'post'  //可选项。HTTP类型，默认post
        , before: function (obj) {
            //预读本地文件示例，不支持ie8
            obj.preview(function (index, file, result) {
                $('#demo1').attr('src', result); //图片链接（base64）
            });
        }
        , done: function (res) {
            //如果上传失败
            if (res.code > 0) {
                return layer.msg('上传失败');
            } else {
                //上传成功
                coverUrl = res.data;
            }
        }
        , error: function () {
            //演示失败状态，并实现重传
            const demoText = $('#demoText');
            demoText.html('<span style="color: #FF5722;">上传失败</span> <a class="layui-btn layui-btn-mini demo-reload">重试</a>');
            demoText.find('.demo-reload').on('click', function () {
                uploadInst.upload();
            });
        }
    });

    // form.verify({
    //     articleTitle: function (val) {
    //         if (val.length > 32) {
    //             return "文章标题过长";
    //         }
    //     },
    //     introduction: function (val) {
    //         if (val.length > 127) {
    //             return "简介内容过长";
    //         }
    //     }
    // });

    form.on("submit(addNews)", function (data) {
        //弹出loading
        const index = top.layer.msg('数据提交中，请稍候', {icon: 16, time: false, shade: 0.8});
        console.log(data.field);
        $.ajax({
            url: $.cookie("tempUrl") + "product/insertSelective?token=" + $.cookie("token"),
            type: "POST",
            datatype: "application/json",
            contentType: "application/json;charset=utf-8",
            data: JSON.stringify({
                categoryId: data.field.productCategory,
                productArticleContent: data.field.productArticleContent,
                productCover: coverUrl,
                productIntroduction: data.field.productIntroduction,
                productName: data.field.productName,
                productPromotion: data.field.productPromotion
            }),
            success: function (result) {
                if (result.code === 0) {
                    layer.msg("新增成功");
                    setTimeout(function () {
                        top.layer.close(index);
                        layer.closeAll("iframe");
                        //刷新父页面
                        parent.location.reload();
                    }, 500);
                } else {
                    layer.msg(result.exception, {icon: 7, anim: 6});
                }
            }
        });
        return false;
    });
});