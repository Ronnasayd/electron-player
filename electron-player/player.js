// Requires
const VideoLib = require('node-video-lib');
const fileSystem = require('fs');
const dragDrop = require('drag-drop')
const ThumbnailGenerator = require('video-thumbnail-generator').default;
const moment = require('moment')


// Initial variables
const firstElement = 0
let togglePlayAndPause = ['play', 'pause'].reverse()
let videoPlayer = element.videoPlayer
let videoPlayerContainer = element.videoPlayerContainer
let videoList = []
let currentVideo = 0
let supportedVideoTypes = ['.mp4', '.mkv', '.avi', '.webm']
let skipPinCounter = 1
let skipList = [];
let skipStages = { 'startOfOpening': 0, 'endOfOpening': 0, 'startOfCredits': 0 }
let skipMode = "0"
let vueApplication
let startOfOpening = 0
let endOfOpening = 0
let startOfCredits = 0
let videoPlayList = []
let counterGenerateThumbmail = 0
let mouseIOTimerController;
let isInFullscreen = false

// Initialize vue vueApplication
vueApplication = new Vue({
    el: ' #side-menu-ul',
    data: {
        files: videoPlayList
    },
    methods: {
        jump: (file) => {
            // console.log(file.path)
            videoPlayer.src = file.path
            videoPlayer.play()
            notification = new Notification(file.title)
            setTimeout(notification.close.bind(notification), 2000);
            setInterval(main, 1000)
            currentVideo = file.counter
            initializeVariablesByCurrentVideo(currentVideo)
        }
    }
})

resetVariables = () => {
    counterGenerateThumbmail = 0;
    currentVideo = 0;
    videoPlayList = [];
}

getSkipFile = (files) => {
    return files.find((file) => {
        if (file.fullPath.includes('.skip')) {
            return file
        }
    })
}

removePreLoadingBanner = () => {
    element.preLoadingBanner.attr('data-display', 'false')
}

isSkipFileExists = (skipFile) => {
    if (skipFile === undefined) {
        return false
    }
    else {
        return true
    }
}

getSkipList = (files) => {
    skipFile = getSkipFile(files)
    if (isSkipFileExists(skipFile)) {
        return JSON.parse(fileSystem.readFileSync(skipFile.path, 'utf8'))
    }
    else {
        return {}
    }

}

renderActiveCurrentVideo = (currentVideo) => {
    $('#side-menu-ul > li').removeClass('isActive')
    setTimeout(() => {
        $('#side-menu-ul > li:nth-child(' + (currentVideo + 1).toString() + ')').addClass('isActive')
    }, 500)
}

getVideoFiles = (files) => {
    return files.filter((element) => {
        return videoIsSupported(element)
    })
}


getNameOfVideo = (video) => {
    return video.fullPath.slice(video.fullPath.lastIndexOf('/') + 1).replace('.mp4', '')
}

sortVideoList = (files) => {
    return files.sort(function (firstVideo, secondVideo) {
        if (videoIsSupported(firstVideo) && videoIsSupported(secondVideo)) {
            nameOfFirstVideo = getNameOfVideo(firstVideo)
            nameOfSecondVideo = getNameOfVideo(secondVideo)
            if (isNaN(nameOfFirstVideo) || isNaN(nameOfSecondVideo)) {
                if (firstVideo.fullPath < secondVideo.fullPath) {
                    return -1
                }
                else {
                    return 1
                }
            }
            else {
                if (parseInt(nameOfFirstVideo) < parseInt(nameOfSecondVideo)) {
                    return -1
                }
                else {
                    return 1
                }
            }

        }

    })
}

// Event functions 
dragDrop('body', function (files) {
    resetVariables()
    removePreLoadingBanner()
    skipList = getSkipList(files)
    initializeVariablesByCurrentVideo(currentVideo)
    files = getVideoFiles(files)
    videoList = sortVideoList(files)
    console.log(videoList)
    index = videoList[firstElement].path.lastIndexOf('/')

    // console.log(videoList)
    videoList.forEach((e, i) => {
        file = {}
        index = videoList[firstElement].path.lastIndexOf('/')
        videoList[firstElement].path.slice(0, index)


        fileSystem.readdir(videoList[firstElement].path.slice(0, index) + '/.thumb', (err, files) => {
            try {
                if (files.length < videoList.length) {
                    generateThumbs(e)
                }
                else {
                    vueApplication.files = videoPlayList
                    renderActiveCurrentVideo(0)
                }

            }
            catch (err) {
                generateThumbs(e)
            }

        })


        fileSystem.open(e.path, 'r', function (err, fd) {
            try {
                let movie = VideoLib.MovieParser.parse(fd);
                file.img = videoList[firstElement].path.slice(0, index) + '/.thumb/' + e.name.replace(".mp4", "") + '-thumbnail-320x240-0001.png'
                file.title = e.name
                file.time = moment(movie.relativeDuration() * 1000).format('mm:ss')
                file.path = e.path
                file.counter = i
                if (skipList.length > 0) {
                    file.isPinned = ((i + 1) <= skipList.length)
                }
                else {
                    file.isPinned = false
                }

                videoPlayList.push(JSON.parse(JSON.stringify(file)))
                // Work with movie
                // console.log('Duration:',
                //     moment(movie.relativeDuration() * 1000).format('mm:ss')
                // );
            } catch (ex) {
                console.error('Error:', ex);
            } finally {
                fileSystem.closeSync(fd);
            }
        });


    })
    videoPlayer.src = videoList[currentVideo].path
    videoPlayer.play()
    notification = new Notification(videoList[currentVideo].name)
    setTimeout(notification.close.bind(notification), 2000);
    setInterval(main, 1000)
})

element.playerAndVideoControls.mousemove(function (e) {
    clearTimeout(mouseIOTimerController);
    element.videoControls.fadeIn()
    $('.video-player').css('cursor', 'default')
    mouseIOTimerController = setTimeout(() => {
        element.videoControls.fadeOut();
        $('.video-player').css('cursor', 'none')
    }, 3000)
})


element.playPauseButton.click(function () {
    if (togglePlayAndPause[firstElement] === 'play') {
        element.playButton.hide()
        element.pauseButton.show()
        videoPlayer.play()
        togglePlayAndPause.reverse()
    }
    else {
        element.playButton.show()
        element.pauseButton.hide()
        videoPlayer.pause()
        togglePlayAndPause.reverse()
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
        if (videoPlayerContainer.requestFullscreen) {
            videoPlayerContainer.requestFullscreen();
        } else if (videoPlayerContainer.mozRequestFullScreen) { /* Firefox */
            videoPlayerContainer.mozRequestFullScreen();
        } else if (videoPlayerContainer.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
            videoPlayerContainer.webkitRequestFullscreen();
        } else if (videoPlayerContainer.msRequestFullscreen) { /* IE/Edge */
            videoPlayerContainer.msRequestFullscreen();
        }

    }

})

element.stepPrevious.click(function () {
    videoPlayer.currentTime = videoPlayer.currentTime - 10
    element.slider.val(100 * videoPlayer.currentTime / videoPlayer.duration)
    element.slider.change()
})

element.stepNext.click(function () {
    videoPlayer.currentTime = videoPlayer.currentTime + 10
    element.slider.val(100 * videoPlayer.currentTime / videoPlayer.duration)
    element.slider.change()
})

element.slider.on('input', function () {
    videoPlayer.currentTime = videoPlayer.duration * ($(this).val() / 100)
    $(this).css("background", "linear-gradient(to right, rgba(99,0,0,0.8) 0%, rgba(99,0,0,0.8) " + this.value + "%, rgba(148, 148, 148, 0.4) " + this.value + "%, rgba(148, 148, 148, 0.4) 100% )")
})

element.slider.on('change', function () {
    $(this).css("background", "linear-gradient(to right, rgba(99,0,0,0.8) 0%, rgba(99,0,0,0.8) " + this.value + "%, rgba(148, 148, 148, 0.4) " + this.value + "%, rgba(148, 148, 148, 0.4) 100% )")
})

videoPlayer.onended = function () {
    currentVideo++
    videoPlayer.src = videoList[currentVideo].path
    videoPlayer.play()
    initializeVariablesByCurrentVideo(currentVideo)
    notification = new Notification(videoList[currentVideo].name)
    setTimeout(notification.close.bind(notification), 2000);
}

element.next.click(function () {
    if (currentVideo >= 0 && currentVideo < videoList.length - 1) {
        currentVideo++
    }
    videoPlayer.src = videoList[currentVideo].path
    videoPlayer.play()
    initializeVariablesByCurrentVideo(currentVideo)
    notification = new Notification(videoList[currentVideo].name)
    setTimeout(notification.close.bind(notification), 2000);

})

element.previous.click(function () {
    if (currentVideo >= 1 && currentVideo <= videoList.length) {
        currentVideo--

    }
    videoPlayer.src = videoList[currentVideo].path
    videoPlayer.play()
    initializeVariablesByCurrentVideo(currentVideo)
    notification = new Notification(videoList[currentVideo].name)
    setTimeout(notification.close.bind(notification), 2000);

})

element.pinButton.click(function () {


    switch (skipPinCounter) {
        case 1:
            skipStages.startOfOpening = videoPlayer.currentTime
            break;
        case 2:
            skipStages.endOfOpening = videoPlayer.currentTime
            break;
        case 3:
            skipStages.startOfCredits = videoPlayer.currentTime
            skipList[currentVideo] = { [currentVideo]: JSON.parse(JSON.stringify(skipStages)) }
            skipStages = { 'startOfOpening': 0, 'endOfOpening': 0, 'startOfCredits': 0 }
            index = videoList[firstElement].path.lastIndexOf('/')
            vueApplication.files[currentVideo].isPinned = true
            fileSystem.writeFile(videoList[firstElement].path.slice(0, index) + '/electron.skip', JSON.stringify(skipList), (err) => {
                console.log(err)
            })
            break;
    }

    skipPinCounter++
    if (skipPinCounter > 3) {
        skipPinCounter = 1
    }
    element.pinText.text(skipPinCounter)


})

element.skipButton.click(() => {
    if (videoPlayer.currentTime <= endOfOpening) {
        videoPlayer.currentTime = endOfOpening
    }
    if (videoPlayer.currentTime > endOfOpening && videoPlayer.currentTime >= startOfCredits) {
        element.next.click()
    }

})

element.skipMenu.click(() => {
    skipMode = element.skipMenu.val()
})

element.sound.on('click', () => {
    videoPlayer.volume = parseFloat(element.sliderSound.val()) / 100
    if (videoPlayer.volume > 1) {
        videoPlayer.volume = 1
    }
    if (videoPlayer.volume < 0) {
        videoPlayer.volume = 0
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
    let slidertime = moment().startOf('day').seconds((e.offsetX / e.target.offsetWidth) * videoPlayer.duration).format('HH:mm:ss');
    $('#slider-output').val(slidertime);
    $('#slider-output').css('left', e.offsetX - $('#slider-output')[firstElement].offsetWidth / 2);
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
            if ((videoPlayer.currentTime >= startOfOpening && videoPlayer.currentTime <= endOfOpening) || videoPlayer.currentTime >= startOfCredits) {
                element.skipButton.fadeIn()
            }
            else {
                element.skipButton.fadeOut()
            }
            break;
        case "2":
            element.pinButton.fadeOut()
            $('#side-menu-ul').addClass('expand-menu')
            if (videoPlayer.currentTime >= startOfOpening && videoPlayer.currentTime <= endOfOpening) {
                videoPlayer.currentTime = endOfOpening
            }
            if (videoPlayer.currentTime > endOfOpening && videoPlayer.currentTime >= startOfCredits) {
                element.next.click()
            }
            break;
    }
}



let initializeVariablesByCurrentVideo = (currentVideo) => {
    renderActiveCurrentVideo(currentVideo)
    skipList.filter((element, index) => {
        if (index === currentVideo) {
            startOfOpening = element[index].startOfOpening
            endOfOpening = element[index].endOfOpening
            startOfCredits = element[index].startOfCredits
            return element
        }
    })
}

let videoIsSupported = (file) => {
    summation = 0
    supportedVideoTypes.forEach((element, index) => {
        summation += file.fullPath.includes(element)
    })
    return Boolean(summation)
}

let generateThumbs = (e) => {
    const tg = new ThumbnailGenerator({
        sourcePath: e.path,
        thumbnailPath: videoList[firstElement].path.slice(0, index) + '/.thumb',
        tmpDir: '/some/writeable/directory' //only required if you can't write to /tmp/ and you need to generate gifs
    });
    tg.generateOneByPercent(100 / 3)
        .then(() => {
            counterGenerateThumbmail++
            if (counterGenerateThumbmail === videoList.length) {
                vueApplication.files = videoPlayList
                renderActiveCurrentVideo(0)
            }
        });
}

// Main function
let main = () => {
    skipSwitch()
    timerText = moment(videoPlayer.currentTime * 1000).format('mm:ss')
    if (!isNaN(videoPlayer.duration)) {
        totalTimeText = moment(videoPlayer.duration * 1000).format('mm:ss')
        element.timerText.text(timerText + ' / ' + totalTimeText)
        element.slider.val(100 * videoPlayer.currentTime / videoPlayer.duration)
        element.slider.change()
    }
}



