// Requires
const VideoLib = require('node-video-lib');
const fs = require('fs');
const dragDrop = require('drag-drop')
const ThumbnailGenerator = require('video-thumbnail-generator').default;
const moment = require('moment')


// Initial variables
let pp_list = ['play', 'pause'].reverse()
let videoplayer = element.player[0]
let videocontainer = $('.video-player')[0]
let list_of_files = []
let contador = 0
let video_types = ['.mp4', '.mkv', '.avi']
let skipList = []
let counterPinClick = 1
let skipContent = [];
let fases = { 'init_intro': 0, 'end_intro': 0, 'end_end': 0 }
let skipMode = "0"
let app
let init_intro = 0
let end_intro = 0
let end_end = 0
let playlist = []
let counterGenerateThumb = 0
let mousetimer
let isInFullscreen = false

// Initialize vue app
app = new Vue({
    el: ' #side-menu-ul',
    data: {
        files: playlist
    },
    methods: {
        jump: (file) => {
            // console.log(file.path)
            videoplayer.src = file.path
            videoplayer.play()
            notification = new Notification(file.title)
            setTimeout(notification.close.bind(notification), 2000);
            setInterval(main, 1000)
            contador = file.counter
            initalizeBySkip(contador)
        }
    }
})


// Event functions 
dragDrop('body', function (files) {
    // console.log(files)
    counterGenerateThumb = 0
    contador = 0
    playlist = []

    $('.initial-message').attr('data-display', 'false')
    skipFile = files.find((element) => {
        if (element.fullPath.includes('.skip')) {
            return element
        }
    })
    // console.log(skipFile)
    if (skipFile === undefined) {
        // console.log('arquivo nao existe')
    }
    else {
        // console.log('arquivo existe')
        skipContent = JSON.parse(fs.readFileSync(skipFile.path, 'utf8'))
        initalizeBySkip(contador)
        skipList = skipContent
    }
    files = files.filter((element) => {
        return verifyVideoType(element)
    })
    // console.log(files)
    list_of_files = files.sort(function (a, b) {
        if (verifyVideoType(a) && verifyVideoType(b)) {
            name_a = a.fullPath.slice(a.fullPath.lastIndexOf('/') + 1).replace('.mp4', '')
            name_b = b.fullPath.slice(b.fullPath.lastIndexOf('/') + 1).replace('.mp4', '')
            if (isNaN(name_a) || isNaN(name_b)) {
                if (a.fullPath < b.fullPath) {
                    return -1
                }
                else {
                    return 1
                }
            }
            else {
                if (parseInt(name_a) < parseInt(name_b)) {
                    return -1
                }
                else {
                    return 1
                }
            }

        }

    })
    index = list_of_files[0].path.lastIndexOf('/')

    // console.log(list_of_files)
    list_of_files.forEach((e, i) => {
        file = {}
        index = list_of_files[0].path.lastIndexOf('/')
        list_of_files[0].path.slice(0, index)


        fs.readdir(list_of_files[0].path.slice(0, index) + '/.thumb', (err, files) => {
            try {
                if (files.length < list_of_files.length) {
                    generateThumbs(e)
                }
                else {
                    app.files = playlist
                    $('#side-menu-ul > li').removeClass('isActive')
                    setTimeout(() => {
                        $('#side-menu-ul > li:nth-child(1)').addClass('isActive')
                    }, 500)
                    // console.log(app.files)
                }

            }
            catch (err) {
                generateThumbs(e)
            }

        })


        fs.open(e.path, 'r', function (err, fd) {
            try {
                let movie = VideoLib.MovieParser.parse(fd);
                file.img = list_of_files[0].path.slice(0, index) + '/.thumb/' + e.name.replace(".mp4", "") + '-thumbnail-320x240-0001.png'
                file.title = e.name
                file.time = moment(movie.relativeDuration() * 1000).format('mm:ss')
                file.path = e.path
                file.counter = i
                if (skipContent.length > 0) {
                    file.isPinned = ((i + 1) <= skipContent.length)
                }
                else {
                    file.isPinned = false
                }

                playlist.push(JSON.parse(JSON.stringify(file)))
                // Work with movie
                // console.log('Duration:',
                //     moment(movie.relativeDuration() * 1000).format('mm:ss')
                // );
            } catch (ex) {
                console.error('Error:', ex);
            } finally {
                fs.closeSync(fd);
            }
        });


    })
    videoplayer.src = list_of_files[contador].path
    videoplayer.play()
    notification = new Notification(list_of_files[contador].name)
    setTimeout(notification.close.bind(notification), 2000);
    setInterval(main, 1000)
})

element.playerAndVideoControls.mousemove(function (e) {
    clearTimeout(mousetimer);
    element.videoControls.fadeIn()
    $('.video-player').css('cursor', 'default')
    mousetimer = setTimeout(() => {
        element.videoControls.fadeOut();
        $('.video-player').css('cursor', 'none')
    }, 3000)
})


element.playPauseButton.click(function () {
    if (pp_list[0] === 'play') {
        element.playButton.hide()
        element.pauseButton.show()
        videoplayer.play()
        pp_list.reverse()
    }
    else {
        element.playButton.show()
        element.pauseButton.hide()
        videoplayer.pause()
        pp_list.reverse()
    }
})

element.fullscrean.click(function () {
    if (isInFullscreen) {
        isInFullscreen = !isInFullscreen
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) { /* Firefox */
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { /* IE/Edge */
            document.msExitFullscreen();
        }
    }
    else {
        isInFullscreen = !isInFullscreen
        if (videocontainer.requestFullscreen) {
            videocontainer.requestFullscreen();
        } else if (videocontainer.mozRequestFullScreen) { /* Firefox */
            videocontainer.mozRequestFullScreen();
        } else if (videocontainer.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
            videocontainer.webkitRequestFullscreen();
        } else if (videocontainer.msRequestFullscreen) { /* IE/Edge */
            videocontainer.msRequestFullscreen();
        }

    }

})

element.stepPrevious.click(function () {
    videoplayer.currentTime = videoplayer.currentTime - 10
    element.slider.val(100 * videoplayer.currentTime / videoplayer.duration)
    element.slider.change()
})

element.stepNext.click(function () {
    videoplayer.currentTime = videoplayer.currentTime + 10
    element.slider.val(100 * videoplayer.currentTime / videoplayer.duration)
    element.slider.change()
})

element.slider.on('input', function () {
    videoplayer.currentTime = videoplayer.duration * ($(this).val() / 100)
    $(this).css("background", "linear-gradient(to right, rgba(99,0,0,0.8) 0%, rgba(99,0,0,0.8) " + this.value + "%, rgba(148, 148, 148, 0.4) " + this.value + "%, rgba(148, 148, 148, 0.4) 100% )")
})

element.slider.on('change', function () {
    $(this).css("background", "linear-gradient(to right, rgba(99,0,0,0.8) 0%, rgba(99,0,0,0.8) " + this.value + "%, rgba(148, 148, 148, 0.4) " + this.value + "%, rgba(148, 148, 148, 0.4) 100% )")
})

videoplayer.onended = function () {
    contador++
    videoplayer.src = list_of_files[contador].path
    videoplayer.play()
    initalizeBySkip(contador)
    notification = new Notification(list_of_files[contador].name)
    setTimeout(notification.close.bind(notification), 2000);
}

element.next.click(function () {
    if (contador >= 0 && contador < list_of_files.length - 1) {
        contador++
    }
    videoplayer.src = list_of_files[contador].path
    videoplayer.play()
    initalizeBySkip(contador)
    notification = new Notification(list_of_files[contador].name)
    setTimeout(notification.close.bind(notification), 2000);

})

element.previous.click(function () {
    if (contador >= 1 && contador <= list_of_files.length) {
        contador--

    }
    videoplayer.src = list_of_files[contador].path
    videoplayer.play()
    initalizeBySkip(contador)
    notification = new Notification(list_of_files[contador].name)
    setTimeout(notification.close.bind(notification), 2000);

})

element.pinButton.click(function () {


    switch (counterPinClick) {
        case 1:
            fases.init_intro = videoplayer.currentTime
            break;
        case 2:
            fases.end_intro = videoplayer.currentTime
            break;
        case 3:
            fases.end_end = videoplayer.currentTime
            skipList[contador] = { [contador]: JSON.parse(JSON.stringify(fases)) }
            fases = { 'init_intro': 0, 'end_intro': 0, 'end_end': 0 }
            index = list_of_files[0].path.lastIndexOf('/')
            app.files[contador].isPinned = true
            fs.writeFile(list_of_files[0].path.slice(0, index) + '/electron.skip', JSON.stringify(skipList), (err) => {
                console.log(err)
            })
            break;
    }

    counterPinClick++
    if (counterPinClick > 3) {
        counterPinClick = 1
    }
    element.pinText.text(counterPinClick)


})

element.skipButton.click(() => {
    if (videoplayer.currentTime <= end_intro) {
        videoplayer.currentTime = end_intro
    }
    if (videoplayer.currentTime > end_intro && videoplayer.currentTime >= end_end) {
        element.next.click()
    }

})

element.skipMenu.click(() => {
    skipMode = element.skipMenu.val()
})

element.sound.on('click', () => {
    videoplayer.volume = parseFloat(element.sliderSound.val()) / 100
    if (videoplayer.volume > 1) {
        videoplayer.volume = 1
    }
    if (videoplayer.volume < 0) {
        videoplayer.volume = 0
    }
})

element.sliderSound.on('input', function () {
    $(this).css("background", "linear-gradient(to right, rgba(99,0,0,0.8) 0%, rgba(99,0,0,0.8) " + this.value + "%, rgba(148, 148, 148, 0.4) " + this.value + "%, rgba(148, 148, 148, 0.4) 100% )")
})

element.sliderSound.on('change', function () {
    $(this).css("background", "linear-gradient(to right, rgba(99,0,0,0.8) 0%, rgba(99,0,0,0.8) " + this.value + "%, rgba(148, 148, 148, 0.4) " + this.value + "%, rgba(148, 148, 148, 0.4) 100% )")
})

element.playList.click(() => {
    // console.log('list')
    element.sideMenu.toggle()
})

onkeydown = (event) => {
    // console.log(event)
    switch (event.key) {
        case "ArrowRight":
            // console.log("right")
            element.stepNext.click()
            break;
        case "ArrowLeft":
            // console.log("left")
            element.stepPrevious.click()
            break;
        case "Control":
            // console.log("control")
            element.pinButton.click()
            break;
        case "ArrowUp":
            // console.log(element.sliderSound.val())
            element.sliderSound.val(parseFloat(element.sliderSound.val()) + 10)
            element.sound.click()
            element.sliderSound.change()
            break;
        case "ArrowDown":
            // console.log("Down")
            element.sliderSound.val(parseFloat(element.sliderSound.val()) - 10)
            element.sound.click()
            element.sliderSound.change()
            break;
        case " ":
            // console.log("space")
            element.playPauseButton.click()
            break;
    }
}


$('.slider').mousemove((e) => {
    $('#slider-output').attr('data-display', 'true');
    let slidertime = moment().startOf('day').seconds((e.offsetX / e.target.offsetWidth) * videoplayer.duration).format('HH:mm:ss');
    $('#slider-output').val(slidertime);
    $('#slider-output').css('left', e.offsetX - $('#slider-output')[0].offsetWidth / 2);
});

$('.slider').mouseout((e) => {
    $('#slider-output').attr('data-display', 'false');
});



// Auxiliar functions
let skipSwitch = () => {
    switch (skipMode) {
        case "0":
            element.pinButton.fadeIn()
            $('#side-menu-ul').removeClass('expand-menu')
            break;
        case "1":
            element.pinButton.fadeOut()
            $('#side-menu-ul').addClass('expand-menu')
            if ((videoplayer.currentTime >= init_intro && videoplayer.currentTime <= end_intro) || videoplayer.currentTime >= end_end) {
                element.skipButton.fadeIn()
            }
            else {
                element.skipButton.fadeOut()
            }
            break;
        case "2":
            element.pinButton.fadeOut()
            $('#side-menu-ul').addClass('expand-menu')
            if (videoplayer.currentTime >= init_intro && videoplayer.currentTime <= end_intro) {
                videoplayer.currentTime = end_intro
            }
            if (videoplayer.currentTime > end_intro && videoplayer.currentTime >= end_end) {
                element.next.click()
            }
            break;
    }
}

let initalizeBySkip = (contador) => {
    $('#side-menu-ul > li').removeClass('isActive')
    $('#side-menu-ul > li:nth-child(' + (contador + 1).toString() + ')').addClass('isActive')



    skipContent.filter((element, index) => {
        if (index === contador) {
            init_intro = element[index].init_intro
            end_intro = element[index].end_intro
            end_end = element[index].end_end
            // console.log(init_intro, end_intro, end_end)
            return element
        }
    })
}

let verifyVideoType = (file) => {
    prod = 0
    video_types.forEach((e, i) => {
        prod += file.fullPath.includes(e)
    })
    return prod
}

let generateThumbs = (e) => {
    const tg = new ThumbnailGenerator({
        sourcePath: e.path,
        thumbnailPath: list_of_files[0].path.slice(0, index) + '/.thumb',
        tmpDir: '/some/writeable/directory' //only required if you can't write to /tmp/ and you need to generate gifs
    });
    tg.generateOneByPercent(100 / 3)
        .then(() => {
            counterGenerateThumb++
            if (counterGenerateThumb === list_of_files.length) {
                app.files = playlist
                $('#side-menu-ul > li').removeClass('isActive')
                setTimeout(() => {
                    $('#side-menu-ul > li:nth-child(1)').addClass('isActive')
                }, 500)
                // console.log(app.files)
            }
        });
}

// Main function
let main = () => {
    skipSwitch()
    timerText = moment(videoplayer.currentTime * 1000).format('mm:ss')
    if (!isNaN(videoplayer.duration)) {
        totalTimeText = moment(videoplayer.duration * 1000).format('mm:ss')
        element.timerText.text(timerText + ' / ' + totalTimeText)
        element.slider.val(100 * videoplayer.currentTime / videoplayer.duration)
        element.slider.change()
    }
}



