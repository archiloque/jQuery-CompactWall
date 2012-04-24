/**
 * jQuery CompactWall v0.0.1
 * A jQuery plugin to organizes blocks in a compact way.
 * http://github.com/archiloque/compact-wall
 *
 * Licensed under the MIT license.
 * Copyright 2012 Julien Kirch
 */

(function ($) {
    $.fn.compactWall = function (blocks, options) {

        // slots represents position where blocks can be placed
        // they define the top and left position of the top left corner and the available height and available width in pixel
        // they are sorted from left to right

        // block represent a block to be placed
        // they contain a height, a width, and a link to the jQuery block object

        // a positioned block represented a block placed somewhere
        // it contains a block and a slot

        function sameHeightSameWidth(slots, slotIndex) {
            var r = slots.slice(0);
            r.splice(slotIndex, 1);
            return r;
        }

        function sameHeightNarrower(slots, slotIndex, slot, block, minBlockWidth) {
            var r = slots.slice(0);
            if ((slots.length > (slotIndex + 1)) &&
                (slots[slotIndex + 1][1] == (slot[1] + block[0])) &&
                (slots[slotIndex + 1][3] == (slot[3] - block[1]))) {
                // wannabe new position is aligned with the next slot
                // this design could have been reached by another organisation
                // but visually it is interesting
                r.splice(slotIndex, 1,
                    [
                        slots[slotIndex + 1][0],
                        slots[slotIndex + 1][1],
                        (slots[slotIndex + 1][2] + block[0]),
                        slots[slotIndex + 1][2]
                    ]);
                return r;
            } else {
                var availableWidth = slot[3] - block[1];
                if (availableWidth >= minBlockWidth) {
                    r.splice(slotIndex, 1, [
                        slot[0],
                        slot[1] + block[1],
                        block[0],
                        availableWidth
                    ]);
                    return r;
                } else {
                    r.splice(slotIndex, 1);
                    return r;
                }
            }
        }

        function smallerNarrower(slots, slotIndex, slot, block, minBlockWidth) {
            var r = slots.slice(0);
            if ((slots.length > (slotIndex + 1)) &&
                (slots[slotIndex + 1][1] == (slot[1] + block[1])) &&
                (slots[slotIndex + 1][3] == (slot[3] - block[1]))) {
                // wannabe new slot is aligned with the next slot
                // this design could have been reached by another organisation
                // but visually it is interesting
                if (slotIndex == 0) {
                    // the current slot is the first one
                    // move it to the bottom and increase height of next one
                    r.splice(0, 2,
                        [
                            slot[0] + block[0],
                            0,
                            Number.POSITIVE_INFINITY,
                            slot[3]
                        ],
                        [
                            slots[slotIndex + 1][0],
                            slots[slotIndex + 1][1],
                            (slots[slotIndex + 1][2] + block[0]),
                            slots[slotIndex + 1][3]
                        ]
                    );
                    return r;
                } else {
                    // current slot is not the first one
                    // increase the size of next one
                    r.splice(slotIndex, 1,
                        [
                            slots[slotIndex + 1][0],
                            slots[slotIndex + 1][1],
                            (slots[slotIndex + 1][2] + block[0]),
                            slots[slotIndex + 1][3]
                        ]
                    );
                    return r;
                }
            } else {
                var availableWidth = (slot[3] - block[1]);
                if (availableWidth >= minBlockWidth) {
                    r.splice(slotIndex, 1,
                        [ slot[0] + block[0],
                            slot[1],
                            (slot[2] - block[0]),
                            slot[3]
                        ],
                        [
                            slot[0],
                            slot[1] + block[1],
                            block[0],
                            availableWidth
                        ]);
                    return r;
                } else {
                    r.splice(slotIndex, 1,
                        [
                            (slot[0] + block[0]),
                            slot[1],
                            (slot[2] - block[0]),
                            slot[3]
                        ]);
                    return r;
                }
            }
        }

        function smallerSameWidth(slots, slotIndex, slot, block) {
            var r = slots.slice(0);
            r.splice(slotIndex, 1,
                [
                    slot[0] + block[0],
                    slot[1],
                    (slot[2] - block[0]),
                    slot[3]
                ]);
            return r;
        }

        /**
         * Represents a position of block.
         * @param containerWith the with of the container.
         * @param positionedBlocks the already positioned blocks.
         * @param slots the list of slots.
         * @param height the current position's height.
         */
        var BlocksPosition = function (positionedBlocks, slots, height, containerWith, minBlockWidth) {
            this.positionedBlocks = positionedBlocks;
            this.height = height;
            this.slots = slots;

            /**
             * Add a block to this position
             * @param block the block to add
             * @maxHeight the max height we want to reach
             */
            this.addBlock = function (block, maxHeight) {
                if (height >= maxHeight) {
                    return [];
                } else {
                    var result = [];
                    // we iterate from end to beginning since the slots are
                    // sorted from the left
                    // so we have a chance to put it higher
                    for (var slotIndex = (slots.length - 1); slotIndex >= 0; slotIndex--) {
                        var slot = slots[slotIndex];
                        if (((slot[0] + block[0]) < maxHeight) &&
                            (slot[2] >= block[0]) &&
                            (slot[3] >= block[1])) {

                            var positionedBlock = [
                                block,
                                slot
                            ];

                            var newSlots = [];

                            if (slot[2] == block[0]) {
                                // the block has the same height than the slot
                                if (slot[3] == block[1]) {
                                    // same height and same width: we kill the slot
                                    newSlots = sameHeightSameWidth(slots, slotIndex);
                                } else {
                                    // same height but narrower : we move the slot to the right
                                    newSlots = sameHeightNarrower(slots, slotIndex, slot, block, minBlockWidth);
                                }
                            } else {
                                // the blocks is smaller
                                if (block[1] == slot[3]) {
                                    // same width but smaller : we move the slot to the bottom
                                    newSlots = smallerSameWidth(slots, slotIndex, slot, block);
                                } else {
                                    // smaller width and smaller height: we move the slot to the bottom
                                    // and add another slot for the upper right corner of the block
                                    newSlots = smallerNarrower(slots, slotIndex, slot, block, minBlockWidth);
                                }
                            }
                            result.push(new BlocksPosition(
                                positionedBlocks.concat([positionedBlock]),
                                newSlots,
                                Math.max(height, slot[0] + block[0]),
                                containerWith,
                                minBlockWidth));
                        }
                    }
                    return result;
                }
            }
        };

        function bestFit(blocksList, containerWidth, minBlockWidth) {
            var initialSlot = [
                0,
                0,
                Number.POSITIVE_INFINITY,
                containerWidth
            ];
            var position = new BlocksPosition([], [initialSlot], 0, containerWidth, minBlockWidth);
            return bestFitInternal(blocksList, position, Number.POSITIVE_INFINITY);
        }

        /**
         * Internal version of bestFit.
         */
        function bestFitInternal(remainingBlocks, position, maxHeight) {
            if (remainingBlocks.length == 1) {
                return bestFitLastBlock(remainingBlocks[0], position, maxHeight);
            } else {
                var bestPositionCandidate = nextFitNextBlock(remainingBlocks, position, maxHeight);
                if (bestPositionCandidate && (bestPositionCandidate.height < maxHeight)) {
                    return bestPositionCandidate
                } else {
                    return null;
                }
            }
        }

        /**
         * Find the best fitting position when adding the last block.
         */
        function bestFitLastBlock(remainingBlock, position, maxHeight) {
            var bestPosition = null;
            var bestHeight = maxHeight;
            var positions = position.addBlock(remainingBlock, bestHeight);
            for (var i = 0; i < positions.length; i++) {
                var newPosition = positions[i];
                if (newPosition.height < bestHeight) {
                    bestHeight = newPosition.height;
                    bestPosition = newPosition;
                }
            }
            return bestPosition;
        }

        /**
         * Find the best fitting position when adding a block to a position
         */
        function nextFitNextBlock(blocks, position, maxHeight) {
            var nextBlock = blocks[0];
            var remainingBlocks = blocks.slice(1);

            var bestPosition = null;
            var bestHeight = maxHeight;

            var positions = position.addBlock(nextBlock, bestHeight);
            for (var i = 0; i < positions.length; i++) {
                var newPosition = positions[i];
                var bestPositionCandidate = bestFitInternal(
                    remainingBlocks,
                    newPosition,
                    bestHeight);
                if (bestPositionCandidate && (bestPositionCandidate.height < bestHeight)) {
                    bestHeight = bestPositionCandidate.height;
                    bestPosition = bestPositionCandidate;
                }
            }
            return bestPosition;
        }

        return this.each(function (i, container) {
            // the block lists
            // all have an height, a width, and a block
            if (blocks.length == 0) {
                return;
            }

            var settings = $.extend({
                'containerWidth': $(container).innerWidth()
            }, options);

            var blockList = [];
            for (var k = 0; k < blocks.length; k++) {
                var blockJ = $(blocks[k]);
                blockList.push([
                    blockJ.outerHeight(true),
                    blockJ.outerWidth(true),
                    blockJ
                ]);
            }

            // sort the blocks by width
            blockList = blockList.sort(function (b1, b2) {
                if (b2[1] == b1[1]) {
                    return b2[0] - b1[0];
                } else {
                    return b2[1] - b1[1];
                }
            });
            var minBlockWidth = blockList[blockList.length - 1][1];

            var position = bestFit(blockList, settings.containerWidth, minBlockWidth);
            if (position) {
                for (var j = 0; j < position.positionedBlocks.length; j++) {
                    var positionnedBlock = position.positionedBlocks[j];
                    $(positionnedBlock[0][2]).
                        css('position', 'absolute').
                        css('top', positionnedBlock[1][0]).
                        css('left', positionnedBlock[1][1]);
                }
                $(container).
                    css('position', 'relative').
                    css('height', position.height);
            }
        });

    };
})(jQuery);
