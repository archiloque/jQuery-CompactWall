/**
 * jQuery CompactWall v2.1.04
 * A jQuery plugin to organizes blocks in a compact way.
 * http://github.com/archiloque/compact-wall
 *
 * Licensed under the MIT license.
 * Copyright 2012 Julien Kirch
 */

(function ($) {
    $.fn.compactWall = function (blocks) {

        /**
         * Represents a position of block.
         * @param containerWith the with of the container.
         * @param positionedBlocks the already positioned blocks.
         * @param slots the list of slots.
         * @param height the current position's height.
         */
        var BlocksPosition = function (positionedBlocks, slots, height, containerWith) {
            this.positionedBlocks = positionedBlocks;
            this.height = height;
            // slots represents position that can be occupied by blocks
            // they are sorted from left to right

            /**
             * Add a block to this position
             * @param block the block to add
             * @maxHeight the max height we want to reach
             * @param callback the callback to be called with the new positions.
             */
            this.addBlock = function (block, maxHeight, callback) {
                $.each(slots, function (slotIndex, slot) {
                    if (((slot.top + block.height) < maxHeight) &&
                        (slot.availableWidth >= block.width) &&
                        (slot.availableHeight >= block.height)) {

                        var positionedBlock = {
                            top: slot.top,
                            left: slot.left,
                            block: block
                        };

                        var newSlots = [];

                        if (slot.availableHeight == block.height) {
                            // the block has the same height than the slot
                            if (slot.availableWidth == block.width) {
                                // same height and same width: we kill the slot => 1
                                newSlots = slots.slice(0, slotIndex)
                                    .concat(slots.slice(slotIndex + 1));

                            } else {
                                // same height but narrower : we move the slot to the right => 4
                                //@todo: possibly merge with slot above
                                newSlots = slots.slice(0, slotIndex)
                                    .concat([
                                    {
                                        top: slot.top,
                                        left: slot.left + block.width,
                                        availableWidth: slot.availableWidth - block.width,
                                        availableHeight: block.availableHeight
                                    }
                                ]).concat(slots.slice(slotIndex + 1));
                            }
                        } else {
                            // the blocks is smaller
                            if (block.width == slot.availableWidth) {
                                // same width but smaller : we move the slot to the bottom => 2
                                newSlots = slots.slice(0, slotIndex)
                                    .concat([
                                    {
                                        top: slot.top + block.height,
                                        left: slot.left,
                                        availableWidth: slot.availableWidth,
                                        availableHeight: slot.availableHeight - block.height
                                    }
                                ]).concat(slots.slice(slotIndex + 1));
                            } else {
                                // smaller width and smaller height: we move the slot to the bottom
                                // and add another slot for the upper right corner of the block => 3
                                //@todo: possibly merge with slot above

                                var newSlotAvailableHeight = -1;
                                if (slot.availableHeight == Number.POSITIVE_INFINITY) {
                                    if (slotIndex == 0) {
                                        newSlotAvailableHeight = block.height;
                                    } else {
                                        newSlotAvailableHeight = (slots[slotIndex - 1].top - (slot.top + block.height));
                                    }
                                } else {
                                    newSlotAvailableHeight = block.height;
                                }
                                newSlots = slots.slice(0, slotIndex)
                                    .concat([
                                    {
                                        top: slot.top + block.height,
                                        left: slot.left,
                                        availableWidth: slot.availableWidth,
                                        availableHeight: slot.availableHeight - block.height
                                    },
                                    {
                                        top: slot.top,
                                        left: slot.left + block.width,
                                        availableWidth: slot.availableWidth - block.width,
                                        availableHeight: newSlotAvailableHeight
                                    }
                                ]).concat(slots.slice(slotIndex + 1));
                            }
                        }

                        callback(new BlocksPosition(
                            positionedBlocks.concat([positionedBlock]),
                            newSlots,
                            Math.max(height, slot.top + block.height),
                            containerWith));
                    }
                });
            }
        };

        var bestFit = function (blocksList, containerWidth) {
            var initialSlot = {
                top: 0,
                left: 0,
                availableWidth: containerWidth,
                availableHeight: Number.POSITIVE_INFINITY
            };
            var position = new BlocksPosition([], [initialSlot], 0, containerWidth);
            return bestFitInternal(blocksList, position, Number.POSITIVE_INFINITY);
        };


        var bestFitInternal = function (remainingBlocks, position, maxHeight) {
            if (remainingBlocks.length == 1) {
                return bestFitLastBlock(remainingBlocks[0], position, maxHeight);
            } else {
                var bestPosition = null;
                var minHeight = maxHeight;
                $.each(remainingBlocks, function (index, block) {
                    var bestPositionCandidate = nextFitNextBlock(remainingBlocks, block, index, position, maxHeight);
                    if (bestPositionCandidate && (bestPositionCandidate.height < minHeight)) {
                        minHeight = bestPositionCandidate.height;
                        bestPosition = bestPositionCandidate;
                    }
                });
                return bestPosition;
            }
        };

        var bestFitLastBlock = function (remainingBlock, position, maxHeight) {
            var bestPosition = null;
            var minHeight = maxHeight;
            position.addBlock(remainingBlock, minHeight, function (newPosition) {
                if(newPosition.height < minHeight) {
                    minHeight = newPosition.height;
                    bestPosition = newPosition;
                }
            });
            return bestPosition;
        };

        var nextFitNextBlock = function (remainingBlocks, block, index, position, maxHeight) {
            var bestPosition = null;
            var minHeight = maxHeight;

            position.addBlock(block, minHeight, function (newPosition) {
                var bestPositionCandidate = bestFitInternal(
                    remainingBlocks.
                        slice(0, index).
                        concat(remainingBlocks.slice(index + 1)),
                        newPosition,
                        minHeight);
                if (bestPositionCandidate && (bestPositionCandidate.height < minHeight)) {
                    minHeight = bestPositionCandidate.height;
                    bestPosition = bestPositionCandidate;
                }
            });
            return bestPosition;
        };

        return this.each(function (i, container) {
            // the block lists
            // all have an height, a width, and a block
            var blockList = $.map(blocks, function (block) {
                var blockJ = $(block);
                return {
                    width: blockJ.outerWidth(true),
                    height: blockJ.outerHeight(true),
                    block: block
                };
            });

            var position = bestFit(blockList, $(container).innerWidth());
            if (position) {
                $.each(position.positionedBlocks, function (index, positionedBlock) {
                    $(positionedBlock.block.block).
                        css('position', 'absolute').
                        css('top', positionedBlock.top).
                        css('left', positionedBlock.left);

                });
                $(container).
                    css('position', 'relative').
                    css('height', position.height);
            }
        });

    };
})(jQuery);
