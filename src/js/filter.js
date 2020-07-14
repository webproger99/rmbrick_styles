const { $ } = window;

$("[data-slide-toggle]").click(function() {
    const filter_object = $(this).data("slide-toggle");
    $(filter_object).slideToggle(500);
})