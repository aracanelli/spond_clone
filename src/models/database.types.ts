export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type RSVPStatus = "yes" | "no" | "pending";
export type MemberRole = "admin" | "organizer" | "player";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          clerk_id: string;
          email: string;
          phone_number: string | null;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          clerk_id: string;
          email: string;
          phone_number?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          clerk_id?: string;
          email?: string;
          phone_number?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          phone_number: string | null;
          carrier: string | null;
          allow_sms: boolean;
          allow_push: boolean;
          allow_email: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          phone_number?: string | null;
          carrier?: string | null;
          allow_sms?: boolean;
          allow_push?: boolean;
          allow_email?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          phone_number?: string | null;
          carrier?: string | null;
          allow_sms?: boolean;
          allow_push?: boolean;
          allow_email?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      push_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          subscription_json: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subscription_json: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          subscription_json?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      groups: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          image_url: string | null;
          owner_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          image_url?: string | null;
          owner_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          image_url?: string | null;
          owner_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "groups_owner_id_fkey";
            columns: ["owner_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      group_members: {
        Row: {
          id: string;
          group_id: string;
          user_id: string;
          role: MemberRole;
          created_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          user_id: string;
          role?: MemberRole;
          created_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          user_id?: string;
          role?: MemberRole;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey";
            columns: ["group_id"];
            referencedRelation: "groups";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "group_members_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      subgroups: {
        Row: {
          id: string;
          group_id: string;
          name: string;
          type: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          name: string;
          type?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          name?: string;
          type?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subgroups_group_id_fkey";
            columns: ["group_id"];
            referencedRelation: "groups";
            referencedColumns: ["id"];
          }
        ];
      };
      subgroup_members: {
        Row: {
          id: string;
          subgroup_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          subgroup_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          subgroup_id?: string;
          user_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subgroup_members_subgroup_id_fkey";
            columns: ["subgroup_id"];
            referencedRelation: "subgroups";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "subgroup_members_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      events: {
        Row: {
          id: string;
          group_id: string;
          subgroup_id: string | null;
          creator_id: string;
          title: string;
          description: string | null;
          location: string | null;
          start_time: string;
          end_time: string;
          is_recurring: boolean;
          recurring_rule: string | null;
          participant_limit: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          subgroup_id?: string | null;
          creator_id: string;
          title: string;
          description?: string | null;
          location?: string | null;
          start_time: string;
          end_time: string;
          is_recurring?: boolean;
          recurring_rule?: string | null;
          participant_limit?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          subgroup_id?: string | null;
          creator_id?: string;
          title?: string;
          description?: string | null;
          location?: string | null;
          start_time?: string;
          end_time?: string;
          is_recurring?: boolean;
          recurring_rule?: string | null;
          participant_limit?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "events_group_id_fkey";
            columns: ["group_id"];
            referencedRelation: "groups";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "events_subgroup_id_fkey";
            columns: ["subgroup_id"];
            referencedRelation: "subgroups";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "events_creator_id_fkey";
            columns: ["creator_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      event_attendees: {
        Row: {
          id: string;
          event_id: string;
          user_id: string;
          rsvp: RSVPStatus;
          rsvp_token: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          user_id: string;
          rsvp?: RSVPStatus;
          rsvp_token?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          user_id?: string;
          rsvp?: RSVPStatus;
          rsvp_token?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "event_attendees_event_id_fkey";
            columns: ["event_id"];
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "event_attendees_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      announcements: {
        Row: {
          id: string;
          group_id: string;
          subgroup_id: string | null;
          sender_id: string;
          title: string;
          content: string;
          event_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          subgroup_id?: string | null;
          sender_id: string;
          title: string;
          content: string;
          event_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          subgroup_id?: string | null;
          sender_id?: string;
          title?: string;
          content?: string;
          event_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "announcements_group_id_fkey";
            columns: ["group_id"];
            referencedRelation: "groups";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "announcements_subgroup_id_fkey";
            columns: ["subgroup_id"];
            referencedRelation: "subgroups";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "announcements_sender_id_fkey";
            columns: ["sender_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "announcements_event_id_fkey";
            columns: ["event_id"];
            referencedRelation: "events";
            referencedColumns: ["id"];
          }
        ];
      };
      group_invitations: {
        Row: {
          id: string;
          group_id: string;
          email: string;
          role: MemberRole;
          token: string;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          email: string;
          role?: MemberRole;
          token: string;
          expires_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          email?: string;
          role?: MemberRole;
          token?: string;
          expires_at?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "group_invitations_group_id_fkey";
            columns: ["group_id"];
            referencedRelation: "groups";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      rsvp_status: RSVPStatus;
      member_role: MemberRole;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Convenience types
export type User = Database["public"]["Tables"]["users"]["Row"];
export type UserPreferences = Database["public"]["Tables"]["user_preferences"]["Row"];
export type PushSubscription = Database["public"]["Tables"]["push_subscriptions"]["Row"];
export type Group = Database["public"]["Tables"]["groups"]["Row"];
export type GroupMember = Database["public"]["Tables"]["group_members"]["Row"];
export type Subgroup = Database["public"]["Tables"]["subgroups"]["Row"];
export type SubgroupMember = Database["public"]["Tables"]["subgroup_members"]["Row"];
export type Event = Database["public"]["Tables"]["events"]["Row"];
export type EventAttendee = Database["public"]["Tables"]["event_attendees"]["Row"];
export type Announcement = Database["public"]["Tables"]["announcements"]["Row"];
export type GroupInvitation = Database["public"]["Tables"]["group_invitations"]["Row"];

// Insert types
export type UserInsert = Database["public"]["Tables"]["users"]["Insert"];
export type UserPreferencesInsert = Database["public"]["Tables"]["user_preferences"]["Insert"];
export type PushSubscriptionInsert = Database["public"]["Tables"]["push_subscriptions"]["Insert"];
export type GroupInsert = Database["public"]["Tables"]["groups"]["Insert"];
export type GroupMemberInsert = Database["public"]["Tables"]["group_members"]["Insert"];
export type SubgroupInsert = Database["public"]["Tables"]["subgroups"]["Insert"];
export type SubgroupMemberInsert = Database["public"]["Tables"]["subgroup_members"]["Insert"];
export type EventInsert = Database["public"]["Tables"]["events"]["Insert"];
export type EventAttendeeInsert = Database["public"]["Tables"]["event_attendees"]["Insert"];
export type AnnouncementInsert = Database["public"]["Tables"]["announcements"]["Insert"];
export type GroupInvitationInsert = Database["public"]["Tables"]["group_invitations"]["Insert"];

// Update types
export type UserUpdate = Database["public"]["Tables"]["users"]["Update"];
export type UserPreferencesUpdate = Database["public"]["Tables"]["user_preferences"]["Update"];
export type PushSubscriptionUpdate = Database["public"]["Tables"]["push_subscriptions"]["Update"];
export type GroupUpdate = Database["public"]["Tables"]["groups"]["Update"];
export type GroupMemberUpdate = Database["public"]["Tables"]["group_members"]["Update"];
export type SubgroupUpdate = Database["public"]["Tables"]["subgroups"]["Update"];
export type SubgroupMemberUpdate = Database["public"]["Tables"]["subgroup_members"]["Update"];
export type EventUpdate = Database["public"]["Tables"]["events"]["Update"];
export type EventAttendeeUpdate = Database["public"]["Tables"]["event_attendees"]["Update"];
export type AnnouncementUpdate = Database["public"]["Tables"]["announcements"]["Update"];
export type GroupInvitationUpdate = Database["public"]["Tables"]["group_invitations"]["Update"];

// Extended types with relations
export interface GroupWithMembers extends Group {
  members?: (GroupMember & { user?: User })[];
  subgroups?: Subgroup[];
  memberCount?: number;
}

export interface EventWithDetails extends Event {
  group?: Group;
  subgroup?: Subgroup;
  creator?: User;
  attendees?: (EventAttendee & { user?: User })[];
  yesCount?: number;
  noCount?: number;
  pendingCount?: number;
}

export interface AnnouncementWithDetails extends Announcement {
  sender?: User;
  group?: Group;
  event?: Event;
}
