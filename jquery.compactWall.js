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

        // a slot represents a position where a block can be placed, it contains
        // - the top position in pixel of the top left corner
        // - the left position in pixel of the top left corner
        // - the available height in pixel
        // - the available width in pixel
        // they are sorted from left to right

        // a block represent a block to be placed, it contains
        // - the height
        // - the width
        // - the jQuery block object

        // a positioned block represented a block placed somewhere, it contains
        // - the block
        // - the slot

        // a position contain
        // - the list of slots
        // - the list of positioned blocks
        // - the total height

        /**
         * Represents a position of block.
         * @param containerWith the with of the container.
         * @param positionedBlocks the already positioned blocks.
         * @param slots the list of slots.
         * @param height the current position's height.
         */

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
            var containerWidth = settings.containerWidth;
            var maxHeight = Number.POSITIVE_INFINITY;


            function sameHeightSameWidth(slots, slotIndex) {
                // block is the same than the slot, just drop the slot
                var r = slots.slice(0);
                r.splice(slotIndex, 1);
                return r;
            }

            function sameHeightNarrower(slots, slotIndex, slot, block) {
                // block is the same height but narrower

                var r = slots.slice(0);
                if ((slots.length > (slotIndex + 1)) &&
                    (slots[slotIndex + 1][1] == (slot[1] + block[1])) &&
                    (slots[slotIndex + 1][3] == (slot[3] - block[1]))) {
                    // wannabe new slot is aligned with the next slot
                    // so instead of adding a new slot
                    // we increase the height of the next one
                    r.splice(slotIndex, 2,
                        [
                            slots[slotIndex + 1][0],
                            slots[slotIndex + 1][1],
                            (slots[slotIndex + 1][2] + block[0]),
                            slots[slotIndex + 1][3]
                        ]);
                } else {
                    // we will add a new slot if it is wide enough
                    var availableWidth = slot[3] - block[1];
                    if (availableWidth >= minBlockWidth) {
                        r.splice(slotIndex, 1, [
                            slot[0],
                            slot[1] + block[1],
                            block[0],
                            availableWidth
                        ]);
                    } else {
                        r.splice(slotIndex, 1);
                    }
                }
                return r;
            }

            function smallerNarrower(slots, slotIndex, slot, block) {
                // block is smaller and narrower than the slot

                var r = slots.slice(0);
                if ((slots.length > (slotIndex + 1)) &&
                    (slots[slotIndex + 1][1] == (slot[1] + block[1])) &&
                    (slots[slotIndex + 1][3] == (slot[3] - block[1]))) {
                    // wannabe new slot is aligned with the next slot
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
                    } else {
                        // current slot is not the first one
                        // we will increase the height of next slot
                        if ((slot[0] + block[0]) == slots[slotIndex - 1][0]) {
                            // bottom of block will be at same height that
                            // the previous block's slot => the current slot disappear
                            r.splice(slotIndex, 2,
                                [
                                    slots[slotIndex + 1][0],
                                    slots[slotIndex + 1][1],
                                    (slots[slotIndex + 1][2] + block[0]),
                                    slots[slotIndex + 1][3]
                                ]
                            );
                        } else {
                            r.splice(slotIndex, 2,
                                [ slot[0] + block[0],
                                    slot[1],
                                    (slot[2] - block[0]),
                                    slot[3]
                                ],
                                [
                                    slots[slotIndex + 1][0],
                                    slots[slotIndex + 1][1],
                                    (slots[slotIndex + 1][2] + block[0]),
                                    slots[slotIndex + 1][3]
                                ]
                            );
                        }
                    }
                } else {
                    // we will add a new slot if it is wide enough
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
                    } else {
                        r.splice(slotIndex, 1,
                            [
                                (slot[0] + block[0]),
                                slot[1],
                                (slot[2] - block[0]),
                                slot[3]
                            ]);
                    }
                }
                return r;
            }

            // smaller but same width
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
             * Add the next block to a position.
             * @params position the original position
             * @param blocks the remaining blocks.
             */
            function addNextBlock(position, blocks) {
                var bestResult = null;
                var block = blocks[0];
                var remainingBlocks = blocks.slice(1);
                var positionedBlocks = position[1];

                // we iterate from end to beginning since the slots are
                // sorted from the left
                // so we have a chance to put it higher
                for (var slotIndex = (position[0].length - 1); slotIndex >= 0; slotIndex--) {
                    var slot = position[0][slotIndex];
                    if (((slot[0] + block[0]) < maxHeight) &&
                        (slot[2] >= block[0]) &&
                        (slot[3] >= block[1])) {

                        var positionedBlock = [
                            block,
                            slot
                        ];

                        // get the max, the max function is just much slower
                        var blockHeight = slot[0] + block[0];
                        var height = (position[2] > blockHeight) ? position[2] : blockHeight;

                        if (remainingBlocks.length == 0) {
                            // it was the last block
                            if (height <= maxHeight) {
                                maxHeight = height;
                                var newBlocks = positionedBlocks.slice(0);
                                newBlocks.splice(-1, 0, positionedBlock);
                                bestResult = [
                                    [],
                                    newBlocks,
                                    height
                                ];
                            }
                        } else {

                            // not the last block => calculate the new slots
                            // then recurse
                            var newSlots = [];
                            if (slot[2] == block[0]) {
                                // the block has the same height than the slot
                                if (slot[3] == block[1]) {
                                    // same height and same width
                                    newSlots = sameHeightSameWidth(position[0], slotIndex);
                                } else {
                                    // same height but narrower
                                    newSlots = sameHeightNarrower(position[0], slotIndex, slot, block);
                                }
                            } else {
                                // the blocks is smaller
                                if (block[1] == slot[3]) {
                                    // same width but smaller
                                    newSlots = smallerSameWidth(position[0], slotIndex, slot, block);
                                } else {
                                    // smaller width and smaller height
                                    newSlots = smallerNarrower(position[0], slotIndex, slot, block);
                                }
                            }

                            // not the last block
                            var newBlocks = positionedBlocks.slice(0);
                            newBlocks.splice(-1, 0, positionedBlock);

                            var candidate =
                                addNextBlock(
                                    [
                                        newSlots,
                                        newBlocks,
                                        height
                                    ],
                                    remainingBlocks
                                );
                            if (candidate && (candidate[2] <= maxHeight)) {
                                bestResult = candidate;
                            }
                        }
                    }
                }
                return bestResult;
            }

            function bestFit(blocksList) {
                return addNextBlock(
                    [
                        [
                            [0, 0, Number.POSITIVE_INFINITY, containerWidth]
                        ],
                        [],
                        0
                    ],
                    blocksList);
            }

            var position = bestFit(blockList);
            if (position) {
                for (var j = 0; j < position[1].length; j++) {
                    var positionedBlock = position[1][j];
                    $(positionedBlock[0][2]).
                        css('position', 'absolute').
                        css('top', positionedBlock[1][0]).
                        css('left', positionedBlock[1][1]);
                }
                $(container).
                    css('position', 'relative').
                    css('height', position[2]);
            }
        });

    };
})(jQuery);
