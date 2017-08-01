var createSlide = function(title, timer) {
    return {
        "title": title,
        "timer": timer * 60
    };
}

var slides = Cookies.getJSON("slides");

if (!slides) {
    slides = [
        createSlide("Planning", 0.1),
        createSlide("Sprint", 7),
        createSlide("Retrospective", 0)
    ];
}

var currentSlideIndex = 0;

/**
 * Renders the outline with the current slide marked
 */
var renderOutline = function() {
    var container = $(".outline");
    container.empty();
    $.each(slides, function(index, slide) {
        var li = $("<li/>")
            .text(slide.title)
            .addClass("name");

        if (currentSlideIndex == index) {
            li.addClass("highlight");
        }
        container.append(li);
    });
};

/**
 * Renders the slide and timer if need be
 */
var renderSlide = function(slideIndex) {
    timerShown = false;
    if (slideIndex >= slides.length) {
        slideIndex = 0;
    }
    var slide = slides[slideIndex];
    $(".slide-title").text(slide.title);

    stopTimer();

    $(".timer").hide();
};

var showTimer = function() {
    timerShown = true;
    var slide = slides[currentSlideIndex];
    if (slide.timer) {
        createTimer(slide.timer);
    }
};

/**
 * Stop the timer
 */
var stopTimer = function() {
    $(".timer-" + currentSlideIndex).stop();
    $(".timer-" + currentSlideIndex).remove();
}

/** 
 * Create timer
 */
var createTimer = function(duration) {
    $(".timer-" + currentSlideIndex).remove();
    var timer = $("<div/>")
        .addClass("timer timer-" + currentSlideIndex);

    var thisSlideId = currentSlideIndex;
    timer.FlipClock(duration, {
        clockFace: 'MinuteCounter',
        countdown: true,
        callbacks: {
            stop: function() {
                if (!timer.is(":visible")) {
                    return;
                }
                var audio = new Audio('/assets/audio/buzzer.mp3');
                audio.play();

                function blink_text() {
                    $('.blinking-text').fadeOut(500);
                    $('.blinking-text').fadeIn(500);
                }
                setInterval(blink_text, 1000);

                $(".timer-" + thisSlideId).html("<h1 class='blinking-text highlight name'>TIME'S UP!</h1>");
            }
        }
    });

    $(".timer-wrapper").append(timer);
};

/**
 * Update slide index
 */
var nextIndex = function() {
    currentSlideIndex++
    if (currentSlideIndex >= slides.length) {
        currentSlideIndex = 0;
    }
}

var previousIndex = function() {
    currentSlideIndex--;
    if (currentSlideIndex < 0) {
        currentSlideIndex = slides.length - 1;
    }
}

/**
 * Progress to next slide
 */
var nextSlide = function() {
    if (slides.length == 0) {
        return;
    }

    var slide = slides[currentSlideIndex];

    if (slide.timer && !$(".timer-" + currentSlideIndex).is(":visible")) {
        showTimer();
    } else {
        nextIndex();
        renderOutline();
        renderSlide(currentSlideIndex);

    }
}

/**
 * Go to previous slide
 */
var previousSlide = function() {
    if (slides.length == 0) {
        return;
    }

    var slide = slides[currentSlideIndex];

    if (slide.timer && $(".timer-" + currentSlideIndex).is(":visible")) {
        stopTimer();
    } else {
        previousIndex();
        renderOutline();
        renderSlide(currentSlideIndex);

    }
}

var counter = 0;
var createForm = function(slide) {
    var index = counter++;
    var handle = $("<span/>")
        .addClass("ui-icon ui-icon-arrowthick-2-n-s");
    var fieldset = $("<fieldset/>")
    var title = $("<input/>")
        .addClass("rmargin10 title")
        .val(slide.title)
        .attr("placeholder", "Title")
        .attr("id", "edit-title-" + index);
    var enable = $("<input/>")
        .addClass("rmargin10")
        .attr("type", "checkbox")
        .val("yes")
        .attr("id", "edit-enable-timer-" + index)
        .change(function() {
            $("#edit-duration-" + index).prop("readonly", !$(this).is(":checked"));
        });;
    if (slide.timer > 0) {
        enable.prop("checked", true);
    }
    var label = $("<label/>")
        .attr("for", "edit-enable-timer-" + index)
        .append(enable, "Enable Timer?");
    var duration = $("<input/>")
        .addClass("rmargin10 lmargin10")
        .addClass("pure-u-1-8 duration")
        .attr("type", "number")
        .attr("id", "edit-duration-" + index);
    if (slide.timer == 0) {
        duration.prop("readonly", true);
    } else {
        duration.val(slide.timer / 60)
    }
    var deleteBtn = $("<button/>")
        .addClass("pure-button button-error")
        .attr("type", "submit")
        .text("Delete Slide")
        .click(function(e) {
            e.preventDefault();
            fieldset.slideUp(function() {
                fieldset.remove();
            });
            return false;
        });

    fieldset.append(handle, title, enable, label, duration, deleteBtn);


    return fieldset;
}

var showEdit = function() {
    var container = $(".slide-edit");
    container.empty();
    $.each(slides, function(index, slide) {
        var fieldset = createForm(slide);
        container.append(fieldset);
    });
    container.sortable();
    container.disableSelection();
    $(".edit-slides").dialog({
        minWidth: 600,
        modal: true,
        buttons: {
            "Add Slide": function() {
                var container = $(".slide-edit");
                var fieldset = createForm(createSlide("", 0));
                container.append(fieldset);
            },
            "Save Slides": function() {
                var newSlides = [];
                $.each($(".slide-edit").children("fieldset"), function(index, slide) {
                    newSlides[newSlides.length] = createSlide($(slide).find(".title").val(), $(slide).find(".duration").val());
                });
                slides = newSlides;

                Cookies.set("slides", slides);

                currentSlideIndex = 0; /* TODO: Fix this */
                renderOutline();
                renderSlide(currentSlideIndex);
                $(this).dialog("close");
            }
        }
    });
}

var aboutModal = function() {
    $(".about").dialog({
        width: 800,
        modal: true,
        buttons: {
            "Close": function() {
                $(this).dialog("close");
            }
        }
    });
};

$(".edit-slides-link").click(function(e) {
    e.preventDefault();

    showEdit();

    return false;
});

$(".about-link").click(function(e) {
    e.preventDefault();

    aboutModal();

    return false;
});

/**
 * Register event
 */
$(window).keydown(function(e) {

    if (!$(".add-slide ").is(":visible") && !$(".edit-slides ").is(":visible")) {
        switch (e.which) {
            case 32: // Spacebar
            case 48: // Down arrow
                nextSlide();
                return false;
            case 38: // Up arrow
                previousSlide();
                return false;
            case 69: // E
                showEdit();
                return false;
        }

    }

});

// Initialize
renderOutline();
renderSlide(0);
aboutModal();