# jQuery CompactWall

CompactWall is a packing jQuery plugin that will organize a set of blocks to use the minimum vertical space,
for example a set of pictures on an image wall.

It is a variation of the [masonry](http://masonry.desandro.com/) plugin to be used the vertical space is more important
than keeping the blocks ordered.

A more detailed documentation and some example can be found [here](http://archiloque.net/compactwall.html).

# Usage

    <div id="container">
      <div class="block">...</div>
      <div class="block">...</div>
      <div class="block">...</div>
      ...
    </div>

    $(function(){
      $('#container').compactWall({
        $('.block')
      });
    });

Note that the blocks should have a know size to be reorganized, for example if you use images in your block you have
to specify their size in the css.

# Parameters

To be passed in a hash as the second argument.

- containerWidth: the width of the container to pack the blocks in, default is the inner width of the object the plugin is called on
- maxTime: the number of milliseconds before the calculation stops, will avoid using too much time when the number of combinations is too high, default is 100ms.

# License

Except files with their own copyright license:

Copyright (c) 2012, Julien Kirch
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the
following conditions are met:

Redistributions of source code must retain the above copyright notice, this list of conditions and the following
disclaimer.
Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following
disclaimer in the documentation and/or other materials provided with the distribution.
Neither the name of BiteScript nor the names of its contributors may be used to endorse or promote products derived from
this software without specific prior written permission.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES,
INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.