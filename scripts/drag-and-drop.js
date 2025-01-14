
var showDropZoneST = false;
var dragAndDropStarted = false;
var dragAndDropInDropZone = false;
var dragAndDropFocus = false;

function showDropZone(event)
{
	clearTimeout(hideDropZoneST);
	clearTimeout(showDropZoneST);

	allowDrag(event);

	let dropZone = document.querySelector('.drop-zone');

	if(!dragAndDropStarted)
		dropZone.innerHTML = template.load('drop.zone.html');

	if(event.target.classList.contains('drop-zone') || event.target.classList.contains('drop-open') || event.target.classList.contains('drop-add'))
	{
		dragAndDropFocus = false;

		dom.queryAll('.drop-zone > div').removeClass('focus');
		if(!event.target.classList.contains('drop-zone'))
		{
			dragAndDropFocus = event.target;
			event.target.classList.add('focus');
		}
	}

	dropZone.classList.remove('hide');
	dropZone.classList.add('active');

	dragAndDropStarted = true;
	dragAndDropInDropZone = true;

	showDropZoneST = setTimeout(function(){

		dragAndDropInDropZone = false;

	}, 1);
}

var hideDropZoneST = false;

function hideDropZone(event, force = false)
{
	if(!force && (!dragAndDropStarted || dragAndDropInDropZone)) return;

	clearTimeout(hideDropZoneST);

	let dropZone = document.querySelector('.drop-zone');

	dropZone.classList.add('hide');

	hideDropZoneST = setTimeout(function(){

		dropZone.classList.remove('hide', 'active');

	}, 500);

	dragAndDropStarted = false;

}

function allowDrag(event)
{
	event.preventDefault();
	event.dataTransfer.dropEffect = 'link';
}

function handleDrop(event)
{
	event.preventDefault();

	if(dragAndDropFocus && event.dataTransfer.files && event.dataTransfer.files[0] && event.dataTransfer.files[0].path)
	{
		let type = dragAndDropFocus.dataset.type;

		console.log(event.dataTransfer.files);

		if(pathIsSupported(event.dataTransfer.files[0].path))
		{
			let files = [];

			for(let i = 0, len = event.dataTransfer.files.length; i < len; i++)
			{
				if(pathIsSupported(event.dataTransfer.files[i].path))
					files.push(event.dataTransfer.files[i].path);
			}

			if(type == 'add')
				addComicsToLibrary(files);
			else
				openComic(files[0]);
		}
		else
		{
			events.snackbar({
				key: 'unsupportedFile',
				text: language.global.unsupportedFile,
				duration: 6,
				update: true,
				buttons: [
					{
						text: language.buttons.dismiss,
						function: 'events.closeSnackbar();',
					},
				],
			});
		}
	}

	dragAndDropFocus = false;

	hideDropZone(event, true);
}

function start()
{
	// Currently the drop event does not return securityScopedBookmarks in macOS MAS, so this would not work correctly https://github.com/electron/electron/issues/40678
	if(macosMAS) return;

	app.event(window, 'dragenter', showDropZone);
	app.event(window, 'dragleave', hideDropZone);
	app.event(window, 'dragover', allowDrag);
	app.event(window, 'drop', handleDrop);

	app.event(document, 'mouseenter', function(event){

		if(dragAndDropStarted)
			hideDropZone(event, true);

	});

}

module.exports = {
	start: start,
};