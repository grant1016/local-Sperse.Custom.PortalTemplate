import { Injectable } from '@angular/core';

@Injectable()
export class SharingService {
    private popWindow(url) {
        let left = (screen.width  - 680) / 2;
        let top = (screen.height - 580) / 2;
        let params = 'menubar=no,toolbar=no,resizable=yes,scrollbars=no,status=no,width=680,height=580,top='+top+',left='+left;  // width='+width+',height='+height+',top='+top+',left='+left
        window.open(url, 'NewWindow', params);  // params = ''; Setting 'params' to an empty string will launch content in a new tab or window rather than a pop-up.
    }

    shareInFacebook(pageURL: string) {
        this.popWindow('https://www.facebook.com/sharer.php?u=' + encodeURIComponent(pageURL));
    }

    shareInTwitter(pageURL: string, text: string, hashtag: string = '') {
        this.popWindow(
            'https://twitter.com/intent/tweet?url=' + encodeURIComponent(pageURL) + '&text=' + encodeURIComponent(text) + '&hashtags=' + encodeURIComponent(hashtag) + '&original_referer=&ref_src=&tw_p=tweetbutton&url='
        );
    }

    shareInLinkedin(pageURL: string, subject: string, message: string) {
        this.popWindow(
            'https://www.linkedin.com/shareArticle?mini=true&title=' + encodeURIComponent(subject) + '&source=&summary=' + encodeURIComponent(message) + '&url=' + encodeURIComponent(pageURL)
        );
    }

    shareInPinterest(pageURL: string, picture: string, message: string, hashtags: string = '') {
        this.popWindow(
            'https://www.pinterest.com/pin/create/button/?mini=true&media=' + encodeURIComponent(picture) + '&description=' + encodeURIComponent(message) + '&hashtags=' + encodeURIComponent(hashtags) + '&url=' + encodeURIComponent(pageURL)
        );
    }

    shareInWhatsapp(pageURL: string) {
        this.popWindow('https://api.whatsapp.com/send?text=' + encodeURIComponent(pageURL));
    }

    shareVieEmail(subject: string, message: string) {
        this.popWindow('mailto:?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(message));
    }
}