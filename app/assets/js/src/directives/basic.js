trainingApp.directive('bodyId', function() {
	return {
		restrict: 'A',
		link: function(scope, element, attr) {
			scope.$watch('currentPage', function(value) 
			{
				if('HomeController' == value) {
					$('body').attr('id', 'homepage');
				}
				if('LessonController' == value) {
					$('body').attr('id', 'lesson');
				}
			});
		}
	}
});

trainingApp.directive('basicStyles', function() {
	return function(scope, element, attr) 
	{
	}
});

trainingApp.directive('fauxRadio', function() {
	return function(scope, element, attr) 
	{
		element.click(function(e) {
			e.preventDefault();
			$(this).parent('ul').find('li').removeClass('selected');
			$(this).addClass('selected');
			$('input[type="radio"]', this).attr('checked', true);
		});
	}
});