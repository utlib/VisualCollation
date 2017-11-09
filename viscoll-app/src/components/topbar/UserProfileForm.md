##### LOCAL STATES

| Name |  Type  |  Description  |  
|---|---|---|
| name | string  | User's name |
| email | string  | User's email address |
| emailMessagePending | boolean  | Gets set to `true` when user submits a new email address |
| emailMessage | boolean  | `true` to show a message that the new email address is pending user activation. This gets toggled only when `emailMessagePending=true` and there are no email errors. |
| currentPassword | string  | The current password |
| newPassword | string  | New password |
| newPasswordConfirm | string  | New password |
| deleteDialog | boolean  | `true` to show delete confirmation dialog |
| unsavedDialog | boolean  | `true` to show unsaved changes dialog |
| errors | object  | Error messages <br>name: string<br>email: string<br>newPassword: string<br>newPasswordConfirm: string<br>currentPassword: string|
| editing | object  | Track fields are that being edited <br>name: boolean<br>email: boolean<br>newPassword: boolean<br>newPasswordConfirm: boolean<br>currentPassword: boolean|

