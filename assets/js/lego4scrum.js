var createSlide = function(title, timer) {
	return {
		"title": title,
		"timer": timer * 60
	};
}

var slides = [
	createSlide("Planning", 0.1), 
	createSlide("Sprint", 7),
	createSlide("Retrospective", 0)
];

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

// Hook up add event
$("#add-slide").click(function(e) {
	e.preventDefault();
	slides[slides.length] = createSlide($("#slide-title-input").val(), $("#slide-duration-input").val());
	
	renderOutline();
	
	$(".add-slide").dialog("close");
	return false;
});

// Hook up edit event
$("#save-slides").click(function(e) {
	e.preventDefault
	
	var newSlides = [];
	$.each(slides, function(index, slide) {
		if (!$("#edit-delete-" + index).is(":checked")) {
			newSlides[newSlides.length] = createSlide($("#edit-title-" + index).val(), $("#edit-duration-" + index).val());	
		}
	});
	slides = newSlides;
	
	currentSlideIndex = 0;
	renderOutline();
	renderSlide(currentSlideIndex);
	
	$(".edit-slides").dialog("close");
	return false;
});

var showEdit = function() {
	var container = $(".slide-edit");
	container.empty();
	$.each(slides, function(index, slide) {
		var div = $("<div/>")
		var title = $("<input/>")
			.val(slide.title)
			.attr("id", "edit-title-" + index);
			
		var duration = $("<input/>")
			.val(slide.timer / 60)
			.attr("id", "edit-duration-" + index);
		
		var deleteMeLabel = $("<label/>")
			.attr("for", "edit-delete-" + index)
			.text("Delete slide?");
		
		var deleteMe = $("<input/>")
			.attr("type", "checkbox")
			.val("yes")
			.attr("id", "edit-delete-" + index);
			
		div.append(title, $("<br>"), duration, $("<br>"), deleteMeLabel, deleteMe, $("<br>"), $("<br>"));
		
		container.append(div);
	});
	$(".edit-slides").dialog();	
}

/**
 * Register event
 */
$(window).keydown(function(e) {
	console.log("Key: " + e.which);
	
	if (!$(".add-slide ").is(":visible") && !$(".edit-slides ").is(":visible")) {
		switch(e.which) {
		case 32: // Spacebar
		case 48: // Down arrow
			nextSlide();
			return false;
		case 38: // Up arrow
			previousSlide();
			return false;
		case 65: // A
			$(".add-slide").dialog();
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