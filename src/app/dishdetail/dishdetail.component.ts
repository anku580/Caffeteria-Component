import { Component, OnInit, Inject} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Comment } from '../shared/feedback';

import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { visibility, flyInOut, expand } from '../animations/app.animation';

import 'rxjs/add/operator/switchMap';

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss'],
  host: {
    '[@flyInOut]': 'true',
    'style': 'display: block;'
  },
  animations: [
    visibility(),
    flyInOut(),
    expand()
  ]
})
export class DishdetailComponent implements OnInit {

  commentForm: FormGroup;
  comment: Comment;
  dish: Dish;
  dishcopy = null;
  dishIds: number[];
  prev: number;
  next: number;
  errMess: string;
  visibility = 'shown';

  formErrors = {
    'author': '',
    'comment': '',
  };

  validationMessages = {
    'author': {
      'required': 'Author Name is required',
      'minlength': 'Author Name must be atleast 2 characters long',
      'maxlength': 'Author Name cannot be more than 25 characters long'
    },
    'comment': {
      'required': 'Comment is required.',
    },
  };

  constructor(private dishservice: DishService, private route: ActivatedRoute, private location: Location, private fb: FormBuilder, @Inject('BaseURL') private BaseURL) { 
    this.createForm();
  }

  ngOnInit() {
    this.dishservice.getDishIds()
      .subscribe(dishIds => this.dishIds = dishIds);

    this.route.params
      .switchMap((params: Params) => { this.visibility = 'hidden'; return this.dishservice.getDish(+params['id']); })
      .subscribe(dish => { this.dish = dish; this.dishcopy = dish;this.setPrevNext(dish.id); this.visibility = 'shown'; },
      errmess => this.errMess = <any>errmess);
  }

  createForm() {
    this.commentForm = this.fb.group({
      author: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)]],
      rating: ['', Validators.required],
      comment: ['', Validators.required]
    });

    this.commentForm.valueChanges
    .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();  //(re)set from validation messages 
  }

  onValueChanged(data?: any) {
    if(!this.commentForm) { return; }
    const form = this.commentForm;
    for (const field in this.formErrors) {
      this.formErrors[field] = '';
      const control = form.get(field);
      if(control && control.dirty && !control.valid) {
        const messages = this.validationMessages[field];
        for (const key in control.errors) {
          this.formErrors[field] += messages[key] + ' ';
        }
      }
    }
  }

  setPrevNext(dishId: number) {
    let index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1)%this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1)%this.dishIds.length];
  }

  goBack() : void {
    this.location.back();
  }

  onSubmit() {
    this.comment = this.commentForm.value;
    var date = new Date();
    var n = date.toISOString();
    this.comment.date = n;
    this.dishcopy.comments.push(this.comment);
    this.dishcopy.save()
      .subscribe(dish => this.dish = dish);
    this.commentForm.reset({
      author:'',
      rating:'',
      comment:''
    });
  }

}
