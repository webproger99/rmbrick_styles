const { $ } = window;

$(".rm-form-group__title").click(function() {
    $(this)
//        .toggleClass("opened")
        .next(".rm-form-group__items")
        .slideToggle();
})