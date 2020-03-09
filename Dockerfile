FROM ubuntu:16.04

# Install tools & libs to compile everything
RUN apt-get update && \
    apt-get install -y curl tzdata build-essential libssl-dev libreadline-dev wget && \
    apt-get clean

# Install nodejs
RUN curl -sL https://deb.nodesource.com/setup_10.x  | bash -
RUN apt-get install -y nodejs && apt-get clean

# Install ruby-build
RUN apt-get install -y git-core && apt-get clean
RUN git clone https://github.com/sstephenson/ruby-build.git && cd ruby-build && ./install.sh

# Install ruby 2.4.1
ENV CONFIGURE_OPTS --disable-install-rdoc
RUN ruby-build 2.6.4 /usr/local
RUN gem install bundler
RUN gem install tzinfo-data

# Clean up downloaded packages
RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*