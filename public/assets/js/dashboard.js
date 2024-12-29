
$(".load").click(function () {
    $(".loading-page").show()
    var counter = 0;
    var c = 0;
    var i = setInterval(function () {
        $(".loading-page .counter h1").html(c + "%");
        $(".loading-page .counter hr").css("width", c + "%");
        counter++;
        c++;
        if (counter == 100) {
            clearInterval(i);
        }
    }, 60);
})

$(".list-inline li").click(function () {
    $('html, body').animate({ scrollTop: 0 }, 0);
})

$("#updateBtn").click(function () {
    event.preventDefault();
    var isValid = true;
    $("#productForm [required]").each(function () {
        if (!$(this).val()) {
            isValid = false;
            return false;
        }
    })
    if (!isValid) {
        iziToast.error({
            title: 'Uyarı!',
            message: 'Ürün bilgilerinde boş bırakılamaz.',
            position: 'topLeft'
        });
    } else {

        $(".editorforhidden").each(function () {
            let myID = $(this).attr("id")
            let editorContent = new Quill('#' + myID).root.innerHTML;
            $(this).siblings('input[type="hidden"]').val(editorContent);
        })
        $(".loading-page").show()
        var counter = 0;
        var c = 0;
        var i = setInterval(function () {
            $(".loading-page .counter h1").html(c + "%");
            $(".loading-page .counter hr").css("width", c + "%");
            counter++;
            c++;
            if (counter == 101) {
                clearInterval(i);
            }
        }, 1);
        $("#productForm").submit();

    }
})



$(".advanced-input").keyup(function () {
    let platform = parseFloat($(".advanced-platform").val())
    let weight = parseFloat($(".advanced-weight").val())/1000
    let profit = parseFloat($(".advanced-profit").val())
    let usd = parseFloat($(".advanced-usd").val())

    let weightPrice = parseFloat(findNearestWeightAndPrice(weight).closestPrice)

    //div-priceBox
    $(".div-priceBox").each(function (index, element) {
        let originalPrice = parseFloat($(element).attr("real-price"))
        let formul = ((originalPrice + profit) / usd) + weightPrice
        formul = formul / (1 - platform / 100)
        formul = formul.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })


        $(element).val(formul.replace(',', '.'))
    });
})

$(document).ready(function () {

    let platform = parseFloat($(".advanced-platform").val())
    let weight = parseFloat($(".advanced-weight").val())/1000
    let profit = parseFloat($(".advanced-profit").val())
    let usd = parseFloat($(".advanced-usd").val())

    let weightPrice = parseFloat(findNearestWeightAndPrice(weight).closestPrice)

    if (profit != 0) {
        $(".div-priceBox").each(function (index, element) {
            let originalPrice = parseFloat($(element).attr("real-price"))
            let valuePrice = parseFloat($(element).val())
            if (originalPrice != valuePrice && $(element).siblings('.warning-box').length > 0) {
                let formul = ((originalPrice + profit) / usd) + weightPrice
                formul = formul / (1 - platform / 100)
                formul = formul.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                $(element).val(formul.replace(',', '.'))
            }
        });
    }

})

$(document).ready(function () {

    $("#agreementBtn").click(function(){
        if ($('#agreementCheckbox').is(':checked')) {
            $("#agreementForm").submit()
        } else {
            iziToast.error({
                title: 'Uyarı!',
                message: 'Sistemi kullanmaya başlamanız için sözleşmeyi onaylamanız gerekmektedir.',
                position: 'topLeft'
            });
        }
    })

})
