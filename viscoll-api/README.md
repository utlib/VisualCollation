# VisColl (Rails API Back-End)

## Introduction

This is the the Rails-driven back-end for Viscoll.

## System Requirements

- `rvm` (>= 1.29.1)
- `ruby` (>= 2.4.1)

### Additional Requirements for Development:

- [`mailcatcher`](https://mailcatcher.me/) (>= 0.6.5)

## Setup

Run the following commands to install the dependencies:
```
rvm --ruby-version use 2.4.1@viscollobns
bundle install
```

Set the admin email address in two locations:

`viscoll-api/app/mailers/mailer.rb` on line 18: 

```
toEmail = Rails.application.secrets.admin_email || "dummy-admin@library.utoronto.ca"
```

and `viscoll-api/app/mailers/feedback_mailer.rb` on line 10:

```
to:"utlviscoll@library.utoronto.ca",
```

Then run this to start the API server:
```
rails s -p 3001
```

If you wish to receive confirmation and password reset emails while developing, also start the mailcatcher daemon:
```
mailcatcher
```

## Testing

Run this command to test once:
```
rspec
```

Alternatively, run this command to test continually while monitoring for changes:
```
guard
```
