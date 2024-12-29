"use strict";
$(document).ready(function(){

    let removeIds = []

    $("#datatable").DataTable();
    var a = $("#datatable-buttons").DataTable({
        order: [[3, 'desc']],
        lengthChange: true,
        buttons: [],
        language: {
            url: '/assets/data/datatable-tr.json'
        },
        columnDefs: [
            { targets: 0, orderable: false } // "Seç" sütununu sıralanamaz yapma
        ]
    });
    $("#key-table").DataTable({
        keys: true
    });
    $("#responsive-datatable").DataTable();
    $("#selection-datatable").DataTable({
        select: {
            style: "multi"
        }
    });
    a.buttons().container().appendTo("#datatable-buttons_wrapper .col-md-6:eq(0)");
    $("#datatable_length select[name*='datatable_length']").addClass("form-select form-select-sm");
    $("#datatable_length select[name*='datatable_length']").removeClass("custom-select custom-select-sm");
    $(".dataTables_length label").addClass("form-label");

    $(".productCheckboxs").click(function(event) {
        // İçindeki checkbox'a doğrudan tıklanıp tıklanmadığını kontrol et
        if (!$(event.target).is(':checkbox')) {
            // İçindeki checkbox'a doğrudan tıklanmadıysa, toggle işlevini gerçekleştir
            $(this).find("input[type='checkbox']").prop("checked", function(i, oldVal) {
                return !oldVal;
            });
        }

        // Herhangi bir checkbox seçili mi kontrol et
        var anyChecked = $(".productCheckboxs input[type='checkbox']:checked").length > 0;

        // Eğer herhangi bir checkbox seçili ise "#clearSelectProducts" div'ini göster, yoksa gizle
        if (anyChecked) {
            $("#clearSelectProducts").show();
        } else {
            $("#clearSelectProducts").hide();
        }

        // Checkbox'ın durumuna göre removeIds dizisini güncelle
        updateRemoveIds();
    });

    // RemoveIds dizisini güncelleyen fonksiyon
    function updateRemoveIds() {
        removeIds = [];
        $(".productCheckboxs input[type='checkbox']:checked").each(function() {
            removeIds.push($(this).val());
        });
    }

    // "#clearSelectProducts button" click olduğunda removeIds'i consola yazdır
    $("#clearSelectProducts button").click(function() {
        var confirmResult = confirm("Seçili ürünleri silmek istediğinizden emin misiniz?");
        if (confirmResult) {
            $("#hiddenIds").val(removeIds); // String'i input değerine ata
            $("#deleteManyForm").submit();
        }
    });

    $('.productsTable thead').on('click', 'tr th:first-child', function () {
        // İçindeki checkbox'a doğrudan tıklanıp tıklanmadığını kontrol et
        if (!$(event.target).is(':checkbox')) {
            // İçindeki checkbox'a doğrudan tıklanmadıysa, toggle işlevini gerçekleştir
            $(this).find("input[type='checkbox']").prop("checked", function(i, oldVal) {
                return !oldVal;
            });
        }

        // Tüm checkbox'ların durumunu topluca değiştirme
        let checkboxes = $(".productsTable tbody input[type='checkbox']").not(".productCheckboxsAll input");
        let allChecked = checkboxes.length === checkboxes.filter(':checked').length;
        
        // Eğer tüm checkbox'lar zaten seçili ise, onları seçili olmaktan çıkar; aksi takdirde tümünü seç
        if (allChecked) {
            $("#clearSelectProducts").hide()
            checkboxes.prop('checked', false);
            updateRemoveIds()
            $(".productCheckboxsAll input").prop('checked',false)      
        } else {
            $("#clearSelectProducts").show()
            checkboxes.prop('checked', true)
            updateRemoveIds()
        }


    });



});

