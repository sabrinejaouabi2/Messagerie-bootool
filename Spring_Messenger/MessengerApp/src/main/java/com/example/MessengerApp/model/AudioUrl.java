package com.example.MessengerApp.model;

import javax.persistence.Embeddable;

import lombok.Getter;
import lombok.Setter;
@Getter
@Setter
@Embeddable
public class AudioUrl {
    private String changingThisBreaksApplicationSecurity; // URL of the audio
}

