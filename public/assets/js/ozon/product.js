$("#uploadOzon").click(function(){

    let saveControl = true
    $(".saveControl").each(function() {
        if($(this).val() == "0"){
            saveControl = false
        }
    });

    if(saveControl){
        var currentPageUrl = window.location.href;
        var num = currentPageUrl.match(/\d+$/)[0];

        $.ajax({
            url: "/sendProduct",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({"groupID": num}),
            beforeSend: function() {
              loading()
            },
            success: function(response) {
              $(".loading-page").hide()
              
              if (response.hasOwnProperty('message')) {
                iziToast.error({
                    title: 'Uyarı!',
                    message: response.message,
                    position:'topLeft'
                });
              }
              else{
                //Send Product To Ozon
                iziToast.success({
                    title: 'Uyarı!',
                    message: "Ürün Başarıyla Yüklendi Ürün Kodu = " + response.task_id,
                    position:'topLeft'
                });
                //Send Product To Ozon
              }
      
              
            }
          })

    }
    else{
        iziToast.error({
            title: 'Uyarı!',
            message: 'Ürünü Platforma Göndermeden Önce Lütfen Kayıt Edin.',
            position:'topLeft'
        });
    }
});