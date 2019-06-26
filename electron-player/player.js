// Requires
const VideoLib = require('node-video-lib');
const fs = require('fs');
const dragDrop = require('drag-drop')
const ThumbnailGenerator = require('video-thumbnail-generator').default;

// Initial variables
let pp_list = ['play', 'pause'].reverse()
let videoplayer = element.player[0]
let list_of_files = []
let contador = 0
let video_types = ['.mp4', '.mkv', '.avi']
let skipList = []
let counterPinClick = 1
let skipContent;
let fases = { 'init_intro': 0, 'end_intro': 0, 'end_end': 0 }
let skipMode = "0"
let app
let init_intro = 0
let end_intro = 0
let end_end = 0
let playlist = []
let counterGenerateThumb = 0

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
    counterGenerateThumb = 0
    contador = 0
    playlist = []

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
            if (a.fullPath < b.fullPath) {
                return -1
            }
            else {
                return 1
            }
        }

    })
    // console.log(list_of_files)
    list_of_files.forEach((e, i) => {
        file = {}
        index = list_of_files[0].path.lastIndexOf('/')
        list_of_files[0].path.slice(0, index)
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

        fs.open(e.path, 'r', function (err, fd) {
            try {
                let movie = VideoLib.MovieParser.parse(fd);
                file.img = list_of_files[0].path.slice(0, index) + '/.thumb/' + e.name.replace(".mp4", "") + '-thumbnail-320x240-0001.png'
                file.title = e.name
                file.time = moment(movie.relativeDuration() * 1000).format('mm:ss')
                file.path = e.path
                file.counter = i
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

element.playerAndVideoControls.mouseenter(function () {
    element.videoControls.fadeIn()
})

element.player.mouseleave(function () {
    element.videoControls.fadeOut()
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
    if (videoplayer.requestFullscreen) {
        videoplayer.requestFullscreen();
    } else if (videoplayer.mozRequestFullScreen) { /* Firefox */
        videoplayer.mozRequestFullScreen();
    } else if (videoplayer.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
        videoplayer.webkitRequestFullscreen();
    } else if (videoplayer.msRequestFullscreen) { /* IE/Edge */
        videoplayer.msRequestFullscreen();
    }
})

element.stepPrevious.click(function () {
    videoplayer.currentTime = videoplayer.currentTime - 10
    element.slider.val(100 * videoplayer.currentTime / videoplayer.duration)
})

element.stepNext.click(function () {
    videoplayer.currentTime = videoplayer.currentTime + 10
    element.slider.val(100 * videoplayer.currentTime / videoplayer.duration)
})

element.slider.click(function () {
    videoplayer.currentTime = videoplayer.duration * ($(this).val() / 100)
})

videoplayer.onended = function () {
    contador++
    videoplayer.src = list_of_files[contador].path
    videoplayer.play()
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

element.sound.click(() => {
    videoplayer.volume = parseFloat(element.sliderSound.val()) / 100
    if (videoplayer.volume > 1) {
        videoplayer.volume = 1
    }
    if (videoplayer.volume < 0) {
        videoplayer.volume = 0
    }
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
            break;
        case "ArrowDown":
            // console.log("Down")
            element.sliderSound.val(parseFloat(element.sliderSound.val()) - 10)
            element.sound.click()
            break;
        case " ":
            // console.log("space")
            element.playPauseButton.click()
            break;
    }
}



// Auxiliar functions
let skipSwitch = () => {
    switch (skipMode) {
        case "0":
            element.pinButton.fadeIn()
            break;
        case "1":
            element.pinButton.fadeOut()
            if ((videoplayer.currentTime >= init_intro && videoplayer.currentTime <= end_intro) || videoplayer.currentTime >= end_end) {
                element.skipButton.fadeIn()
            }
            else {
                element.skipButton.fadeOut()
            }
            break;
        case "2":
            element.pinButton.fadeOut()
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

// Main function
let main = () => {
    skipSwitch()
    timerText = moment(videoplayer.currentTime * 1000).format('mm:ss')
    totalTimeText = moment(videoplayer.duration * 1000).format('mm:ss')
    element.timerText.text(timerText + ' / ' + totalTimeText)
    element.slider.val(100 * videoplayer.currentTime / videoplayer.duration)
}



