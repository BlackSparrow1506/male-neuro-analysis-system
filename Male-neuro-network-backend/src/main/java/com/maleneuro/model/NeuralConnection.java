package com.maleneuro.model;

public class NeuralConnection {

    private String sourceRegion;
    private String targetRegion;
    private double strength; // 0.0 to 1.0
    private String type;     // "excitatory" or "inhibitory"

    public NeuralConnection() {}

    public NeuralConnection(String sourceRegion, String targetRegion, double strength, String type) {
        this.sourceRegion = sourceRegion;
        this.targetRegion = targetRegion;
        this.strength = strength;
        this.type = type;
    }

    public String getSourceRegion() { return sourceRegion; }
    public void setSourceRegion(String sourceRegion) { this.sourceRegion = sourceRegion; }

    public String getTargetRegion() { return targetRegion; }
    public void setTargetRegion(String targetRegion) { this.targetRegion = targetRegion; }

    public double getStrength() { return strength; }
    public void setStrength(double strength) { this.strength = strength; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
}
