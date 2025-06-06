import EventModel from '../models/Event.js';

export const resolvers = {
  Query: {
    events: async () => {
      try {
        return await EventModel.find({}).sort({ startTime: -1 });
      } catch (err) {
        throw new Error('Failed to fetch events');
      }
    },

    event: async (_, { id }) => {
      try {
        return await EventModel.findById(id);
      } catch (err) {
        throw new Error('Event not found');
      }
    },

    filterEventsByDate: async (_, { startDate, endDate }) => {
      try {
        const filter = {};

        if (startDate && endDate) {
          filter.startTime = { $gte: new Date(startDate) };
          filter.endTime = { $lte: new Date(endDate) };
        } else if (startDate) {
          filter.startTime = { $gte: new Date(startDate) };
        } else if (endDate) {
          filter.endTime = { $lte: new Date(endDate) };
        }

        return await EventModel.find(filter).sort({ startTime: -1 })
      } catch (err) {
        throw new Error('Failed to filter events by date');
      }
    },
  },

  Mutation: {
    addEvent: async (_, { input }) => {
      try {
        const event = new EventModel({
          ...input,
          startTime: new Date(input.startTime),
          endTime: new Date(input.endTime),
        });
        return await event.save();
      } catch (err) {
        throw new Error('Failed to add event');
      }
    },

    updateEvent: async (_, { id, input }) => {
      try {
        return await EventModel.findByIdAndUpdate(
          id,
          {
            ...input,
            startTime: new Date(input.startTime),
            endTime: new Date(input.endTime),
          },
          { new: true }
        );
      } catch (err) {
        throw new Error('Failed to update event');
      }
    },

    deleteEvent: async (_, { id }) => {
      try {
        const res = await EventModel.findByIdAndDelete(id);
        return !!res;
      } catch (err) {
        throw new Error('Failed to delete event');
      }
    },
  },
};
