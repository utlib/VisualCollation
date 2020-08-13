## Staging Server Setup

### Requirements

* [Python](https://python.org/)

### Installation

Optionally, install a virtual environment via
[pyenv](https://github.com/pyenv/pyenv-installer):

```plaintext
$ curl https://pyenv.run | bash
$ pyenv virtualenv vceditor-ansible
$ pyenv local vceditor-ansible
```

Now install dependencies, i. e. [Ansible](https://www.ansible.com/) and roles
from [Ansible Galaxy](https://galaxy.ansible.com/):

```plaintext
$ pip install -r requirements.txt
$ ansible-galaxy install -r roles.yml
```

### Deployment

```plaintext
$ ansible-playbook playbooks/site.yml
```

