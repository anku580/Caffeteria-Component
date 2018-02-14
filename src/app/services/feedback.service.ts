import { Injectable } from '@angular/core';
import { RestangularModule, Restangular } from 'ngx-restangular';
import { Observable } from 'rxjs/Observable';
import { Feedback, ContactType } from '../shared/feedback';

@Injectable()
export class FeedbackService {

  constructor(private restangular: Restangular) { }

  submitFeedback(feed_obj: Feedback): Observable<Feedback> {
    return this.restangular.all('feedback').post(feed_obj);
  }

}
